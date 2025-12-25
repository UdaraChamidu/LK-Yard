# Lankan-Yard 🏗️

**Sri Lanka's Premier Construction Marketplace**

LankaYard is a modern web platform connecting construction professionals, subcontractors, and suppliers with customers. It facilitates the buying/selling of tools, hiring of heavy machinery, and posting of job opportunities within the construction industry.

## 🚀 Features

-   **User Authentication**: Secure Login/Register via Firebase Auth.
-   **Listings Management**:
    -   **Buy & Sell**: Tools and building materials.
    -   **Hire Machines**: Heavy machinery rental services.
    -   **Jobs**: Construction industry job board.
-   **Profiles**:
    -   **Professionals**: Civil Engineers, Architects, Quantity Surveyors.
    -   **Subcontractors**: Masons, Plumbers, Electricians.
-   **Dashboard**: Comprehensive user dashboard to manage listings, bookings, and inquiries.
-   **Messaging**: In-app messaging system for buyers and sellers.
-   **Search & Filtering**: Advanced filtering by category, location, price, and more.

## 🛠️ Tech Stack

-   **Frontend**: React 19, Vite 7
-   **Styling**: Tailwind CSS 3, Shadcn UI (Custom Implementation)
-   **State Management**: React Query (TanStack Query)
-   **Routing**: React Router DOM v7
-   **Backend**: Firebase (Authentication, Firestore, Storage)
-   **Icons**: Lucide React

## 🏁 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm (v9 or higher)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project folder.
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Configuration (Firebase)

This project relies on **Firebase** for backend services. You must set up a Firebase project and configure the environment variables.

1.  Create a project at [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** (Email/Password provider).
3.  Enable **Firestore Database** (Start in Test Mode).
4.  Enable **Storage** (Start in Test Mode).
5.  Create a `.env` file in the root directory and add your keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🗄️ Data Seeding

Since a new Firebase project starts empty, we have included a built-in tool to populate initial data.

1.  **Register** a new account and login.
2.  Navigate to `/AdminTools` manually in your browser URL bar.
3.  Click **"Seed Profiles"** to add sample Professionals and Subcontractors.
4.  Click **"Seed Listings"** to add sample Tools and Machinery.
5.  Check the **"Professionals"** or **"Buy & Sell"** pages to verify the data.

## 📂 Project Structure

```
src/
├── api/            # API Clients (Firebase wrapper)
├── components/     # Reusable UI components
│   ├── layout/     # Layout wrappers (Sidebar, Navbar)
│   ├── listings/   # Listing cards and related views
│   ├── ui/         # Base UI elements (Button, Input, etc.)
│   └── ...
├── context/        # React Context (AuthContext)
├── entities/       # JSON Schemas/Types
├── hooks/          # Custom React Hooks
├── lib/            # Utilities & Config (Firebase init)
├── pages/          # Application Routes/Pages
└── ...
```

## 📜 License

Private Property of LankaYard.
