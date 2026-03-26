import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TripProvider } from './src/context/TripContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import AppNavigator from './src/navigation/AppNavigator';
import BiometricAuthScreen from './src/screens/BiometricAuthScreen';

/**
 * Handle auth state (biometric / login)
 */
const AppContent = () => {
  const { isAuthenticated, authenticate } = useAuth();

  console.log('isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return (
      <BiometricAuthScreen
        onSuccess={() => {
          console.log('LOGIN SUCCESS');
          authenticate();
        }}
      />
    );
  }

  return <AppNavigator />;
};

/**
 * Root App
 */
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <TripProvider>
            {/* 🔥 PENTING: pakai AppContent, bukan AppNavigator langsung */}
            <AppContent />
          </TripProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
