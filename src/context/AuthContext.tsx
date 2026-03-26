import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

type AuthContextType = {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔥 SAFE STORAGE INIT
let storage: any;

try {
  storage = new MMKV();
} catch (error) {
  console.log('MMKV error, fallback aktif:', error);

  // fallback kalau MMKV gagal (misalnya remote debug aktif)
  storage = {
    getString: () => null,
    set: () => {},
    delete: () => {},
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const stored = storage.getString('isAuthenticated');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.log('Read storage error:', e);
    }
  }, []);

  const authenticate = () => {
    try {
      storage.set('isAuthenticated', 'true');
      setIsAuthenticated(true);
    } catch (e) {
      console.log('Write storage error:', e);
    }
  };

  const logout = () => {
    try {
      storage.delete('isAuthenticated');
      setIsAuthenticated(false);
    } catch (e) {
      console.log('Delete storage error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};