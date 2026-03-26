import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '@react-native-vector-icons/material-icons';

const rnBiometrics = new ReactNativeBiometrics();

const BiometricAuthScreen = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

 const checkBiometricAvailability = async () => {
  try {
    const { available } = await rnBiometrics.isSensorAvailable();
    setIsBiometricAvailable(available); // <-- ini yang kurang
  } catch (error) {
    console.warn(error);
    setIsBiometricAvailable(false);
  }
};

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Verifikasi sidik jari atau Face ID untuk absensi',
        cancelButtonText: 'Batal',
      });
      if (success) {
        onSuccess();
      } else {
        Alert.alert('Gagal', 'Verifikasi biometrik gagal. Coba lagi.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat verifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isBiometricAvailable === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  if (!isBiometricAvailable) {
    return (
      <View style={styles.container}>
        <Icon name="fingerprint" size={80} color="#999" />
        <Text style={styles.title}>Perangkat tidak mendukung biometrik</Text>
        <Text style={styles.message}>
          Aplikasi membutuhkan fingerprint atau Face ID untuk keamanan.
        </Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={onSuccess}>
          <Text style={styles.fallbackText}>Lanjutkan tanpa biometrik (demo)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f5f5f5', '#e0e0e0']} style={styles.container}>
      <View style={styles.card}>
        <Icon name="fingerprint" size={80} color="#FF9800" />
        <Text style={styles.title}>Absensi Driver</Text>
        <Text style={styles.message}>
          Verifikasi identitas Anda dengan sidik jari atau Face ID
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleBiometricAuth}
          disabled={isLoading}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="fingerprint" size={24} color="#fff" />
                <Text style={styles.buttonText}>Verifikasi Sekarang</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    width: '100%',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  fallbackButton: {
    marginTop: 20,
    padding: 12,
  },
  fallbackText: {
    color: '#FF9800',
    fontSize: 14,
  },
});

export default BiometricAuthScreen;