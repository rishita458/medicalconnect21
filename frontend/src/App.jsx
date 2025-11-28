import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginSignup from './pages/LoginSignup';
import Dashboard from './pages/Dashboard';
import DashboardPatient from './pages/DashboardPatient';
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardAdmin from './pages/dashboards/DashboardAdmin';
import DashboardPharmacist from './pages/DashboardPharmacist';

function Protected({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/auth" />;
}

export default function App() {
  const location = useLocation();
  const showFooter = !location.pathname.includes('/dashboard') && location.pathname !== '/auth';
  
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/patient" element={<Protected><DashboardPatient /></Protected>} />
        <Route path="/dashboard/doctor" element={<Protected><DashboardDoctor /></Protected>} />
        <Route path="/dashboard/admin" element={<Protected><DashboardAdmin /></Protected>} />
        <Route path="/dashboard/pharmacist" element={<Protected><DashboardPharmacist /></Protected>} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}
