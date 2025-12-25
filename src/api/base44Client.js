const STORAGE_KEY = 'base44_auth_user';

export const base44 = {
  auth: {
    isAuthenticated: async () => {
      const user = localStorage.getItem(STORAGE_KEY);
      return !!user;
    },
    me: async () => {
      const user = localStorage.getItem(STORAGE_KEY);
      if (!user) throw new Error('Not authenticated');
      return JSON.parse(user);
    },
    login: async (email, password) => {
      // Mock login - accept any credentials, but demonstrate a "demo" user
      const user = {
        id: 'user_123',
        email: email || 'demo@lkyard.lk',
        full_name: 'Demo User',
        role: 'admin',
        location: 'Colombo',
        phone: '+94771234567',
        avatar_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69480f5d3b7800a9469b8931/e59d0284e_image.png'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    },
    logout: async () => {
      localStorage.removeItem(STORAGE_KEY);
    },
    redirectToLogin: () => {
      window.location.href = '/Login';
    },
    updateMe: async (data) => {
      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
  },
  entities: {
    Listing: {
      filter: async () => {
          // Return some mock listings
          return [
              {
                  id: '1',
                  title: 'Hilti TE 70-ATC/AVR Combi Hammer',
                  price: 150000,
                  type: 'SALE',
                  category: 'Tools',
                  location: 'Colombo',
                  image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                  description: 'Heavy duty combi hammer for drilling and chiseling.',
                  seller: { name: 'Build Corp', rating: 4.8 },
                  created_at: new Date().toISOString()
              },
               {
                  id: '2',
                  title: 'Excavator for Rent - CAT 320',
                  price: 25000,
                  type: 'RENT',
                  category: 'Heavy Machinery',
                  location: 'Kandy',
                  image: 'https://images.unsplash.com/photo-1582226294371-33157297d025?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  images: ['https://images.unsplash.com/photo-1582226294371-33157297d025?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                  description: 'Daily rental rate. Operator included.',
                   seller: { name: 'Kandy Construction', rating: 4.5 },
                  created_at: new Date().toISOString()
              }
          ]
      },
      list: async () => [],
      create: async (data) => ({ id: Math.random().toString(), ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true,
      get: async (id) => ({
          id: id,
          title: 'Hilti TE 70-ATC/AVR Combi Hammer',
          price: 150000,
          type: 'SALE',
          category: 'Tools',
          location: 'Colombo',
          images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          description: 'Heavy duty combi hammer for drilling and chiseling.',
          seller: { name: 'Build Corp', rating: 4.8, id: 'seller_1' },
          created_at: new Date().toISOString()
      })
    },
    Booking: {
      filter: async () => [],
      create: async (data) => data
    },
    Favorite: {
      filter: async () => [],
      create: async (data) => data,
      delete: async () => true
    },
    LeadRequest: {
      filter: async () => [],
      create: async (data) => data
    },
    Message: {
      filter: async () => [],
      create: async (data) => data
    },
    Profile: {
      filter: async () => [],
      list: async () => [],
      update: async (id, data) => ({ id, ...data }),
       get: async (id) => ({
        id: id,
        full_name: 'John Doe',
        role: 'Professional',
        rating: 4.8,
        location: 'Colombo',
        about: 'Experienced architect with 10 years of field work.',
        skills: ['Architecture', 'Design', 'Planning'],
        portfolio: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
      })
    },
    Report: {
      create: async (data) => data
    },
    Review: {
      filter: async () => [],
      create: async (data) => data,
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true
    },
    User: {
      list: async () => []
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => ({ file_url: URL.createObjectURL(file) })
    }
  }
};
