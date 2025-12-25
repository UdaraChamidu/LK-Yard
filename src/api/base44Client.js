import { auth, db, storage } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION_MAP = {
  Listing: 'listings',
  Booking: 'bookings',
  Favorite: 'favorites',
  LeadRequest: 'lead_requests',
  Message: 'messages',
  Profile: 'profiles',
  Report: 'reports',
  Review: 'reviews',
  User: 'users'
};

const getCollection = (entityName) => collection(db, COLLECTION_MAP[entityName]);

// Helper to convert Firestore doc to object with ID
const docToObj = (doc) => ({ id: doc.id, ...doc.data() });

export const base44 = {
  auth: {
    // Check if user is currently signed in
    isAuthenticated: () => new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    }),
    
    // Get current user details combining Auth and Firestore Profile
    me: async () => {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe();
          if (!user) {
            reject(new Error('Not authenticated'));
            return;
          }
          try {
            // Fetch additional user details from 'users' collection or 'profiles'
            // For now, returning basic auth info enriched with a profile check
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            resolve({
              uid: user.uid,
              email: user.email,
              full_name: user.displayName || user.email.split('@')[0],
              ...(userDoc.exists() ? userDoc.data() : {})
            });
          } catch (error) {
            reject(error);
          }
        });
      });
    },

    login: async (email, password) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    },

    register: async (email, password, fullName) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create a user profile document
      await base44.entities.User.create({
        uid: userCredential.user.uid,
        email: email,
        full_name: fullName,
        role: 'user', // Default role
        created_at: serverTimestamp()
      });
      return userCredential.user;
    },

    logout: async () => {
      await signOut(auth);
    },

    redirectToLogin: (returnUrl) => {
       // In a real app, you might use the router here, but window.location is safe fallback
       window.location.href = `/Login?returnUrl=${encodeURIComponent(returnUrl || '/')}`;
    },

    updateMe: async (data) => {
       const user = auth.currentUser;
       if (!user) throw new Error('No user logged in');
       
       // Update 'users' collection
       const userDocRef = doc(db, 'users', user.uid);
       // Allow creating if it doesn't exist (set with merge is safer but update is requested)
       // We'll use set with merge behavior manually via Generic Update helper if doc exists
       // Or handle existence check. Simplified here:
       await updateDoc(userDocRef, data).catch(async (err) => {
           // If doc missing, create it
           if (err.code === 'not-found') {
               const { setDoc } = await import('firebase/firestore');
               await setDoc(userDocRef, data);
           } else {
               throw err;
           }
       });
       return { ...data, uid: user.uid };
    }
  },

  entities: {
    // Generic handlers for all entities
    ...Object.keys(COLLECTION_MAP).reduce((acc, entity) => {
      acc[entity] = {
        filter: async (filters = {}, sortField = null, limitCount = 50) => {
          let q = getCollection(entity);
          
          // Apply Filters
          Object.entries(filters).forEach(([key, value]) => {
             q = query(q, where(key, '==', value));
          });
          
          // Apply Sort (NOTE: Firestore requires indexes for compound queries)
          if (sortField) {
              const direction = sortField.startsWith('-') ? 'desc' : 'asc';
              const field = sortField.replace(/^-/, '');
              q = query(q, orderBy(field, direction));
          }

          // Apply Limit
          if (limitCount) {
             q = query(q, limit(limitCount));
          }

          const snapshot = await getDocs(q);
          return snapshot.docs.map(docToObj);
        },

        list: async (sortField = null, limitCount = 50) => {
           let q = getCollection(entity);
           if (sortField) {
              const direction = sortField.startsWith('-') ? 'desc' : 'asc';
              const field = sortField.replace(/^-/, '');
              q = query(q, orderBy(field, direction));
           }
           if (limitCount) {
              q = query(q, limit(limitCount));
           }
           const snapshot = await getDocs(q);
           return snapshot.docs.map(docToObj);
        },

        get: async (id) => {
          const docRef = doc(db, COLLECTION_MAP[entity], id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return docToObj(docSnap);
          } else {
             throw new Error(`${entity} not found`);
          }
        },

        create: async (data) => {
          const colRef = getCollection(entity);
          const docRef = await addDoc(colRef, {
            ...data,
            created_date: new Date().toISOString(), // Fallback for simple date handling
            created_at: serverTimestamp()
          });
          return { id: docRef.id, ...data };
        },

        update: async (id, data) => {
          const docRef = doc(db, COLLECTION_MAP[entity], id);
          await updateDoc(docRef, {
             ...data,
             updated_date: new Date().toISOString()
          });
          return { id, ...data };
        },

        delete: async (id) => {
          const docRef = doc(db, COLLECTION_MAP[entity], id);
          await deleteDoc(docRef);
          return true;
        }
      };
      return acc;
    }, {})
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { file_url: url };
      }
    }
  }
};
