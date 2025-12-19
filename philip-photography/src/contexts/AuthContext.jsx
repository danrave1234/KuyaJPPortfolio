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
    isAdmin: user && user.email === 'jpmoradanaturegram@gmail.com', // Replace with your admin email
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
















