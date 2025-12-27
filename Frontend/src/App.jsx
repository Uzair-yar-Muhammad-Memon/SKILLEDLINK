import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import UserProfile from './pages/UserProfile.jsx';
import WorkerDashboard from './pages/WorkerDashboard.jsx';
import WorkerProfile from './pages/WorkerProfile.jsx';
import WorkerReviews from './pages/WorkerReviews.jsx';
import WorkerJobRequests from './pages/WorkerJobRequests.jsx';
import WorkerMyJobs from './pages/WorkerMyJobs.jsx';
import BrowseServices from './pages/BrowseServices.jsx';
import ServiceDetails from './pages/ServiceDetails.jsx';
import RequestsPage from './pages/RequestsPage.jsx';
import MessagingPage from './pages/MessagingPage.jsx';
import { useRole } from './context/RoleContext.jsx';

// Smart Home Component that redirects based on login state
function SmartHome() {
  const { role, loading } = useRole();
  
  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }
  
  // If user is logged in, redirect to their dashboard
  if (role === 'user') {
    return <Navigate to="/user" replace />;
  }
  if (role === 'worker') {
    return <Navigate to="/worker" replace />;
  }
  
  // If not logged in, show Home page
  return <Home />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SmartHome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected User Routes - Service Receiver Features */}
        <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute allowedRoles={['user']}><BrowseServices /></ProtectedRoute>} />
        <Route path="/service/:id" element={<ProtectedRoute allowedRoles={['user']}><ServiceDetails /></ProtectedRoute>} />
        <Route path="/user/requests" element={<ProtectedRoute allowedRoles={['user']}><RequestsPage /></ProtectedRoute>} />
        
        {/* Protected Worker Routes - Service Provider Features */}
        <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['worker']}><WorkerProfile /></ProtectedRoute>} />
        <Route path="/worker/reviews" element={<ProtectedRoute allowedRoles={['worker']}><WorkerReviews /></ProtectedRoute>} />
        <Route path="/worker/jobs" element={<ProtectedRoute allowedRoles={['worker']}><WorkerJobRequests /></ProtectedRoute>} />
        <Route path="/worker/my-jobs" element={<ProtectedRoute allowedRoles={['worker']}><WorkerMyJobs /></ProtectedRoute>} />
        <Route path="/worker/requests" element={<ProtectedRoute allowedRoles={['worker']}><RequestsPage /></ProtectedRoute>} />
        
        {/* Shared Protected Routes */}
        <Route path="/messages/:requestId" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
