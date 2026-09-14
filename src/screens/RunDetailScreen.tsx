import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { AppMapView, AppMapViewRef } from '../components/Map';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/run';
import { storageService } from '../services/storageService';
import { formatTimer, formatDateTime } from '../utils/timeFormatter';
import { StatCard } from '../components/StatCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type RunDetailScreenRouteProp = RouteProp<RootStackParamList, 'RunDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RunDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RunDetailScreenRouteProp>();
  const { run } = route.params;

  const mapRef = useRef<AppMapViewRef | null>(null);

  useEffect(() => {
    if (run.coordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(run.coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [run.coordinates]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Run',
      'Are you sure you want to permanently delete this workout from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteRun(run.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting run:', error);
              Alert.alert('Error', 'Failed to delete run.');
            }
          },
        },
      ]
    );
  };

  const startCoord = run.coordinates.length > 0 ? run.coordinates[0] : null;
  const finishCoord =
    run.coordinates.length > 1 ? run.coordinates[run.coordinates.length - 1] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>RUN DETAILS</Text>
          <Text style={styles.headerSubtitle}>
            {formatDateTime(run.startTime || run.date)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, styles.deleteButton]}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <AppMapView
            ref={mapRef}
            style={styles.map}
            routeCoordinates={run.coordinates}
            showStartMarker={true}
            showFinishMarker={true}
            showUserMarker={false}
          />
        </View>

        {/* Primary Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <StatCard
              label="Distance"
              value={run.distance.toFixed(2)}
              unit="KM"
              iconName="navigate"
              accentColor="#10B981"
              style={{ flex: 1, marginRight: 8 }}
              isLarge={true}
            />
            <StatCard
              label="Duration"
              value={formatTimer(run.duration)}
              iconName="time"
              accentColor="#38BDF8"
              style={{ flex: 1, marginLeft: 8 }}
              isLarge={true}
            />
          </View>

          <View style={[styles.statsRow, { marginTop: 12 }]}>
            <StatCard
              label="Average Pace"
              value={run.averagePace}
              unit="MIN/KM"
              iconName="speedometer"
              accentColor="#F59E0B"
              style={{ flex: 1, marginRight: 8 }}
            />
            <StatCard
              label="Average Speed"
              value={run.averageSpeed.toFixed(1)}
              unit="KM/H"
              iconName="flash"
              accentColor="#EC4899"
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          {/* Coordinates points info */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>GPS Data Points</Text>
              <Text style={styles.metaValue}>{run.coordinates.length} points recorded</Text>
            </View>
            <View style={[styles.metaRow, { marginTop: 8 }]}>
              <Text style={styles.metaLabel}>Workout Status</Text>
              <Text style={[styles.metaValue, { color: '#10B981' }]}>Completed & Verified</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.4,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  routeMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startMarker: {
    backgroundColor: '#3B82F6',
  },
  finishMarker: {
    backgroundColor: '#EF4444',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  metaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
