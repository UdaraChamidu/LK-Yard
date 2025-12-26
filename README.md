# Lanka Yard (LK Yard)

LK Yard is a comprehensive digital marketplace and professional directory tailored for the construction industry in Sri Lanka. It connects clients with contractors, professionals, equipment rentals, and building material suppliers in a seamless, modern web application.

## 🚀 Features

### Marketplace & Rentals
- **Buy & Sell**: A marketplace for construction tools and materials.
- **Hire Machines**: Equipment rental listings with filtering by machine type (Excavators, Cranes, etc.) and location.
- **Construction Jobs**: A dedicated job board for finding employment in the construction sector.
- **Subcontractors**: Find specialized trade groups (Masonry, Plumbing, Electrical, etc.).

### Professional Directory
- **Expert Professionals**: verified profiles for Civil Engineers, Architects, Quantity Surveyors, etc.
- **Advanced Filtering**: Search by designation, location, daily rate, and rating.
- **Verified Badges**: Trust indicators for vetted professionals.

### User Experience
- **User Dashboard**: Manage listings, view bookings, and handle favorites.
- **Admin Tools**: Dedicated admin dashboard for user management and platform oversight.
- **Secure Authentication**: Email/Password login powered by Firebase Authentication.
- **Responsive Design**: Fully mobile-optimized interface with modern UI/UX components.
- **Favorites**: Save listings and profiles for quick access.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
- **Language**: JavaScript (ES Modules)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `shadcn/ui` components.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **State Management & Caching**: [TanStack Query](https://tanstack.com/query/latest)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore)
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting

## ⚙️ Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project with Firestore and Authentication enabled.

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/lk-yard.git
    cd lk-yard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 🚀 Build & Deployment

This project is configured for deployment on **Firebase Hosting**.

### 1. Build the project
```bash
npm run build
```
This generates the production files in the `dist` directory.

### 2. Deploy to Firebase
Ensure you have the Firebase CLI installed and logged in:
```bash
npm install -g firebase-tools
firebase login
```

Initialize Firebase (if not done):
```bash
firebase init hosting
```
- Select **Use an existing project**.
- Set public directory to `dist`.
- Configure as a single-page app (Rewrite all URLs to /index.html? **Yes**).

Deploy:
```bash
firebase deploy
```

## 📂 Project Structure

```
src/
├── api/            # Base44/Firebase API client wrapper
├── assets/         # Static images and icons
├── components/     # Reusable UI components (Layout, Listings, UI Library)
├── context/        # React Context (AuthContext)
├── data/           # Mock data for development
├── entities/       # Data models/schemas (JSON)
├── lib/            # Library configurations (Firebase, Utils)
├── pages/          # Application Pages (Home, Dashboard, Login, etc.)
└── utils/          # Helper functions
```

## 🔒 Security

- **Route Protection**: `ProtectedRoute` and `AdminRoute` components ensure restricted access to sensitive pages.
- **Firebase Rules**: Firestore security rules should be configured to protect data integrity.

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
Built with ❤️ for the Sri Lankan Construction Industry.
