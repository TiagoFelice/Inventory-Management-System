import React, { createContext, useContext, useEffect, useState } from 'react';
import { authStorage } from '@/lib/storage/auth-storage';
import { isAuthenticated } from './auth.hooks';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = () => {
      setAuthenticated(isAuthenticated());
      setIsLoading(false);
    };

    syncAuthState();

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth:changed', syncAuthState);
    window.addEventListener('auth:unauthorized', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth:changed', syncAuthState);
      window.removeEventListener('auth:unauthorized', syncAuthState);
    };
  }, []);

  const logout = () => {
    authStorage.clearTokens();
    setAuthenticated(false);
    window.dispatchEvent(new CustomEvent('auth:changed'));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
