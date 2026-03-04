'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getCurrentUser, signOutUser } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fallbackAdminEmails = ['jpmoradanaturegram@gmail.com', 'danravekeh123@gmail.com', 'admin@gmail.com'];
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  const allowedAdminEmails = adminEmails.length > 0
    ? adminEmails
    : fallbackAdminEmails.map(email => email.toLowerCase());

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    currentUser: getCurrentUser,
    // Helper functions
    isAdmin: !!(
      user &&
      user.email &&
      allowedAdminEmails.includes(user.email.trim().toLowerCase())
    ),
    signOut: async () => {
      try {
        await signOutUser();
        setUser(null);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
















