import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTrip } from '../context/TripContext';
import { Trip, Stop } from '../types';
import Geolocation from '@react-native-community/geolocation';
import Icon from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width } = Dimensions.get('window');

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type TripProcessRouteProp = RouteProp<RootStackParamList, 'TripProcess'>;
type TripProcessNavigationProp = StackNavigationProp<RootStackParamList, 'TripProcess'>;

const TripProcessScreen = () => {
  const route = useRoute<TripProcessRouteProp>();
  const navigation = useNavigation<TripProcessNavigationProp>();
  const { tripId } = route.params;
  const { trips, completeStop, completeTrip } = useTrip();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [currentStop, setCurrentStop] = useState<Stop | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [gpsConfirmed, setGpsConfirmed] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);

  // Start entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Izin Kamera',
            message: 'Aplikasi membutuhkan akses kamera untuk mengambil foto bukti.',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message: 'Aplikasi membutuhkan akses lokasi untuk konfirmasi GPS.',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setCurrentTrip(trip);
      const index = trip.stops.findIndex(stop => !stop.completed);
      setCurrentStopIndex(index >= 0 ? index : 0);
      setCurrentStop(trip.stops[index >= 0 ? index : 0]);
      if (index >= 0) {
        const stop = trip.stops[index];
        setPhotoTaken(!!stop.photoUri);
        setGpsConfirmed(!!stop.gpsConfirmed);
        setPhotoUri(stop.photoUri || null);
      }
    }
  }, [trips, tripId]);

  useEffect(() => {
    if (currentTrip && currentStopIndex < currentTrip.stops.length) {
      const stop = currentTrip.stops[currentStopIndex];
      setCurrentStop(stop);
      setPhotoTaken(!!stop.photoUri);
      setGpsConfirmed(!!stop.gpsConfirmed);
      setPhotoUri(stop.photoUri || null);
      setLocation(null);
      setLocationError(null);
      setDistanceToTarget(null);
    }
  }, [currentStopIndex, currentTrip]);

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Izin ditolak', 'Aplikasi membutuhkan izin kamera untuk mengambil foto.');
      return;
    }
    // Simulasi kamera
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    Alert.alert('Ambil Foto', 'Simulasi: foto berhasil diambil', [
      { text: 'OK', onPress: () => {
        setPhotoUri('simulated_uri');
        setPhotoTaken(true);
        ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
      } }
    ]);
  };

  const confirmGps = () => {
    setGpsConfirmed(true);
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
    Alert.alert('Lokasi Dikonfirmasi', `Lokasi berhasil direkam${distanceToTarget ? ` (jarak ${Math.round(distanceToTarget)}m dari target)` : ''}`);
  };

  const handleConfirmGps = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Izin ditolak', 'Aplikasi membutuhkan izin lokasi untuk konfirmasi.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });

        if (currentStop?.requiredLat && currentStop?.requiredLng) {
          const distance = calculateDistance(latitude, longitude, currentStop.requiredLat, currentStop.requiredLng);
          setDistanceToTarget(distance);
          if (distance > 100) {
            Alert.alert(
              'Lokasi Tidak Sesuai',
              `Anda berada ${Math.round(distance)} meter dari lokasi yang seharusnya. Apakah Anda yakin ingin melanjutkan?`,
              [
                { text: 'Batal', style: 'cancel' },
                { text: 'Tetap Konfirmasi', onPress: () => confirmGps() }
              ]
            );
            setIsLoadingLocation(false);
            return;
          }
        }
        confirmGps();
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMsg = 'Gagal mendapatkan lokasi.';
        if (error.code === 1) {
          errorMsg = 'Izin lokasi ditolak. Harap izinkan di pengaturan.';
        } else if (error.code === 2) {
          errorMsg = 'GPS tidak aktif. Silakan aktifkan GPS.';
          Alert.alert('GPS Tidak Aktif', errorMsg, [
            { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
            { text: 'Batal', style: 'cancel' },
          ]);
          return;
        } else if (error.code === 3) {
          errorMsg = 'Timeout mengambil lokasi. Coba lagi.';
        }
        setLocationError(errorMsg);
        Alert.alert('Error', errorMsg);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const handleCompleteStop = () => {
    if (!photoTaken) {
      Alert.alert('Belum selesai', 'Anda harus mengambil foto terlebih dahulu');
      return;
    }
    if (!gpsConfirmed) {
      Alert.alert('Belum selesai', 'Anda harus mengonfirmasi GPS terlebih dahulu');
      return;
    }

    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);

    if (currentTrip && currentStop) {
      completeStop(currentTrip.id, currentStop.id, {
        photoUri: photoUri || 'simulated_uri',
        gpsConfirmed: true,
      });
    }

    if (currentTrip && currentStopIndex + 1 < currentTrip.stops.length) {
      // Animate to next stop
      setCurrentStopIndex(currentStopIndex + 1);
      setPhotoTaken(false);
      setGpsConfirmed(false);
      setPhotoUri(null);
      setLocation(null);
      setDistanceToTarget(null);
    } else {
      if (currentTrip) {
        completeTrip(currentTrip.id);
        Alert.alert('Sukses', 'Perjalanan selesai!');
        navigation.goBack();
      }
    }
  };

  if (!currentTrip || !currentStop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const isStopCompleted = currentStop.completed;
  const hasTarget = !!(currentStop.requiredLat && currentStop.requiredLng);
  const progress = (currentStopIndex + (photoTaken && gpsConfirmed ? 1 : 0)) / currentTrip.stops.length;

  return (
    <LinearGradient colors={['#f5f5f5', '#e0e0e0']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header with progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Step {currentStopIndex + 1} of {currentTrip.stops.length}
            </Text>
          </View>

          {/* Customer Card */}
          <LinearGradient colors={['#ffffff', '#fafafa']} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.cardHeader}>
              <Icon name="account-circle" size={40} color="#FF9800" />
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{currentTrip.customerName}</Text>
                <View style={styles.dateRow}>
                  <Icon name="event" size={16} color="#888" />
                  <Text style={styles.dateText}>{currentTrip.date}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Stop Card */}
          <LinearGradient colors={['#ffffff', '#fafafa']} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.stopIconContainer}>
              <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.stopIconGradient}>
                <Icon name={currentStop.type === 'PICKUP' ? 'location-on' : 'flag'} size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.stopType}>{currentStop.type === 'PICKUP' ? 'Penjemputan' : 'Pengantaran'}</Text>
            </View>

            <View style={styles.addressContainer}>
              <Icon name="place" size={20} color="#FF9800" />
              <Text style={styles.addressText}>{currentStop.address}</Text>
            </View>

            {hasTarget && (
              <View style={styles.targetContainer}>
                <Icon name="gps-fixed" size={16} color="#4CAF50" />
                <Text style={styles.targetText}>
                  Target: {currentStop.requiredLat?.toFixed(6)}, {currentStop.requiredLng?.toFixed(6)}
                </Text>
              </View>
            )}

            {location && (
              <View style={styles.locationContainer}>
                <Icon name="my-location" size={16} color="#2196F3" />
                <Text style={styles.locationText}>
                  Lokasi Anda: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </Text>
                {distanceToTarget !== null && (
                  <Text style={[styles.distanceText, distanceToTarget <= 100 ? styles.distanceOk : styles.distanceError]}>
                    Jarak: {Math.round(distanceToTarget)} m {distanceToTarget <= 100 ? '✓' : '✗'}
                  </Text>
                )}
              </View>
            )}
            {locationError && (
              <View style={styles.errorContainer}>
                <Icon name="error" size={16} color="#F44336" />
                <Text style={styles.errorText}>{locationError}</Text>
              </View>
            )}
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleTakePhoto}
              disabled={photoTaken || isStopCompleted}
              activeOpacity={0.8}>
              <LinearGradient
                colors={photoTaken ? ['#4CAF50', '#2E7D32'] : ['#2196F3', '#1976D2']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Icon name={photoTaken ? 'check-circle' : 'photo-camera'} size={24} color="#fff" />
                <Text style={styles.buttonText}>{photoTaken ? 'Foto Diambil' : 'Ambil Foto'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleConfirmGps}
              disabled={gpsConfirmed || isStopCompleted || isLoadingLocation}
              activeOpacity={0.8}>
              <LinearGradient
                colors={gpsConfirmed ? ['#4CAF50', '#2E7D32'] : ['#FF9800', '#F57C00']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                {isLoadingLocation ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Icon name={gpsConfirmed ? 'check-circle' : 'gps-fixed'} size={24} color="#fff" />
                )}
                <Text style={styles.buttonText}>
                  {isLoadingLocation ? 'Mengambil Lokasi...' : (gpsConfirmed ? 'GPS Dikonfirmasi' : 'Konfirmasi GPS')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={styles.completeWrapper}
            onPress={handleCompleteStop}
            disabled={!photoTaken || !gpsConfirmed || isStopCompleted}
            activeOpacity={0.8}>
            <LinearGradient
              colors={(!photoTaken || !gpsConfirmed || isStopCompleted) ? ['#BDBDBD', '#9E9E9E'] : ['#FF9800', '#F57C00']}
              style={styles.gradientCompleteButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Icon name={currentStopIndex + 1 === currentTrip.stops.length ? 'check-circle' : 'arrow-forward'} size={24} color="#fff" />
              <Text style={styles.completeButtonText}>
                {currentStopIndex + 1 === currentTrip.stops.length ? 'Selesaikan Perjalanan' : 'Lanjut ke Stop Berikutnya'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    marginLeft: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#888',
  },
  stopIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9800',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  targetText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#4CAF50',
  },
  locationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 6,
  },
  distanceText: {
    fontSize: 12,
    marginLeft: 22,
    marginTop: 4,
  },
  distanceOk: {
    color: '#4CAF50',
  },
  distanceError: {
    color: '#F44336',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 6,
  },
  actionsContainer: {
    marginVertical: 20,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  completeWrapper: {
    marginTop: 8,
  },
  gradientCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 3,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default TripProcessScreen;