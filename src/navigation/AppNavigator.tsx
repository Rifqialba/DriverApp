import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import TripProcessScreen from '../screens/TripProcessScreen';
import CameraScreen from '../screens/CameraScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  TripProcess: { tripId: string };
  Camera: { onPhotoTaken: (uri: string) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Daftar Pekerjaan' }} />
        <Stack.Screen name="TripProcess" component={TripProcessScreen} options={{ title: 'Proses Perjalanan' }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Ambil Foto' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;