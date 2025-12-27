import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../api/client';

const RoleContext = createContext();
export const useRole = () => useContext(RoleContext);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(null); // 'worker' | 'user'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setRole(userData.role);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const setAuth = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <RoleContext.Provider value={{ role, setRole, user, setAuth, logout, loading }}>
      {children}
    </RoleContext.Provider>
  );
}
