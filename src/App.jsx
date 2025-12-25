import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BuySell from './pages/BuySell';
import Dashboard from './pages/Dashboard';
import EditListing from './pages/EditListing';
import HireMachines from './pages/HireMachines';
import Jobs from './pages/Jobs';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import PostAd from './pages/PostAd';
import Professionals from './pages/Professionals';
import ProfileDetail from './pages/ProfileDetail';
import RequestQuote from './pages/RequestQuote';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Subcontractors from './pages/Subcontractors';
import AdminTools from './pages/AdminTools';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout Wrapper to access current page name
const LayoutWrapper = ({ children, pageName }) => {
  return (
    <Layout currentPageName={pageName}>
      {children}
    </Layout>
  );
};

import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          
          <Route path="/" element={<LayoutWrapper pageName="Home"><Home /></LayoutWrapper>} />
          <Route path="/Home" element={<LayoutWrapper pageName="Home"><Home /></LayoutWrapper>} />
          
          <Route path="/BuySell" element={<LayoutWrapper pageName="BuySell"><BuySell /></LayoutWrapper>} />
          <Route path="/HireMachines" element={<LayoutWrapper pageName="HireMachines"><HireMachines /></LayoutWrapper>} />
          <Route path="/Jobs" element={<LayoutWrapper pageName="Jobs"><Jobs /></LayoutWrapper>} />
          <Route path="/Professionals" element={<LayoutWrapper pageName="Professionals"><Professionals /></LayoutWrapper>} />
          <Route path="/Subcontractors" element={<LayoutWrapper pageName="Subcontractors"><Subcontractors /></LayoutWrapper>} />
          <Route path="/Search" element={<LayoutWrapper pageName="Search"><Search /></LayoutWrapper>} />
          <Route path="/Listing/:id" element={<LayoutWrapper pageName="BuySell"><ListingDetail /></LayoutWrapper>} />
          <Route path="/Profile/:id" element={<LayoutWrapper pageName="Professionals"><ProfileDetail /></LayoutWrapper>} />

          {/* Protected Routes */}
          <Route 
            path="/Dashboard" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="Dashboard">
                  <Dashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/PostAd" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="PostAd">
                  <PostAd />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/EditListing/:id" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="Dashboard">
                  <EditListing />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Messages" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="Messages">
                  <Messages />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/RequestQuote" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="RequestQuote">
                  <RequestQuote />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Settings" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="Settings">
                  <Settings />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/AdminTools" 
            element={
              <ProtectedRoute>
                <LayoutWrapper pageName="Admin Tools">
                  <AdminTools />
                </LayoutWrapper>
              </ProtectedRoute>
            } 
          />
          {/* Catch all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
