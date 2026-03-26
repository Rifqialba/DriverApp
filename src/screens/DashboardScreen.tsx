import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useTrip } from '../context/TripContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const { trips, currentTripId, startTrip } = useTrip();
  const navigation = useNavigation<DashboardNavigationProp>();

  const handleStartTrip = (tripId: string) => {
    if (currentTripId) {
      Alert.alert('Perjalanan Aktif', 'Anda sedang mengerjakan trip lain. Selesaikan terlebih dahulu.');
      return;
    }
    startTrip(tripId);
    navigation.navigate('TripProcess', { tripId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'schedule';
      case 'in_progress':
        return 'play-circle-filled';
      case 'completed':
        return 'check-circle';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'in_progress':
        return '#FF9800';
      case 'completed':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isDisabled = currentTripId !== null && currentTripId !== item.id;
    const statusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleStartTrip(item.id)}
        disabled={isDisabled || item.status !== 'available'}>
        <LinearGradient
          colors={isDisabled ? ['#F5F5F5', '#EEEEEE'] : ['#FFFFFF', '#FAFAFA']}
          style={[styles.card, isDisabled && styles.disabledCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <View style={styles.cardHeader}>
            <View style={styles.customerInfo}>
              <Icon name="person" size={24} color="#FF9800" />
              <Text style={styles.customerName}>{item.customerName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Icon name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status === 'available' ? 'Tersedia' : item.status === 'in_progress' ? 'Sedang Berjalan' : 'Selesai'}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Icon name="event" size={18} color="#666" />
              <Text style={styles.infoText}>{item.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="swap-vert" size={18} color="#666" />
              <Text style={styles.infoText}>
                {item.stops.length} Stop
              </Text>
            </View>
          </View>

          {item.status === 'available' && !isDisabled && (
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.startButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Text style={styles.startButtonText}>Ambil Pekerjaan</Text>
              <Icon name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          )}

          {isDisabled && (
            <View style={styles.disabledIndicator}>
              <Icon name="lock" size={16} color="#999" />
              <Text style={styles.disabledText}>Sedang ada perjalanan aktif</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#f5f5f5', '#e0e0e0']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Pekerjaan</Text>
        <Text style={styles.headerSubtitle}>
          {trips.filter(t => t.status === 'available').length} pekerjaan tersedia
        </Text>
      </View>

      <FlatList
        data={trips}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  disabledIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  disabledText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
});

export default DashboardScreen;