import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useRole();

  // Wait for loading to complete before redirecting
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'user') {
      return <Navigate to="/user" replace />;
    } else if (role === 'worker') {
      return <Navigate to="/worker" replace />;
    }
    return <Navigate to="/signup" replace />;
  }

  return children;
}
