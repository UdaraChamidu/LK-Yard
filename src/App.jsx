import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

// Placeholder Pages (we will create these later)
const BuySell = () => <div>Buy & Sell Page</div>;
const Professionals = () => <div>Professionals Page</div>;
const Dashboard = () => <div>Dashboard</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="buy-sell" element={<BuySell />} />
          <Route path="professionals" element={<Professionals />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* Add more routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
