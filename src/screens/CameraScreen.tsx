import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

const CameraScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { onPhotoTaken } = route.params as { onPhotoTaken: (uri: string) => void };
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const takePhoto = async () => {
    if (camera.current && device) {
      try {
        const photo = await camera.current.takePhoto();
        setPhotoUri(photo.path);
        onPhotoTaken(photo.path);
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Gagal mengambil foto');
      }
    }
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Kamera tidak tersedia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <Text style={styles.buttonText}>Ambil Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  buttonContainer: { position: 'absolute', bottom: 30, alignSelf: 'center' },
  captureButton: { backgroundColor: 'white', padding: 15, borderRadius: 50, paddingHorizontal: 25 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
});

export default CameraScreen;