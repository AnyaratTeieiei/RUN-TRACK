import React, { useEffect, useRef, useState } from 'react';
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

type SummaryScreenRouteProp = RouteProp<RootStackParamList, 'Summary'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SummaryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SummaryScreenRouteProp>();
  const { run } = route.params;

  const mapRef = useRef<AppMapViewRef | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // Zoom map to fit the entire route
    if (run.coordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(run.coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [run.coordinates]);

  const handleSaveRun = async () => {
    if (isSaved) {
      navigation.navigate('MainTabs');
      return;
    }

    try {
      setIsSaving(true);
      await storageService.saveRun({
        date: run.date,
        startTime: run.startTime,
        endTime: run.endTime,
        duration: run.duration,
        distance: run.distance,
        averageSpeed: run.averageSpeed,
        averagePace: run.averagePace,
        coordinates: run.coordinates,
      });

      setIsSaved(true);
      Alert.alert('Run Saved! 🎉', 'Your run has been recorded in your running history.', [
        {
          text: 'View History',
          onPress: () => {
            navigation.navigate('MainTabs');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to save run:', error);
      Alert.alert('Error', 'Failed to save workout to history.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAgain = () => {
    navigation.navigate('MainTabs');
  };

  const handleBackHome = () => {
    navigation.navigate('MainTabs');
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
          style={styles.backButton}
          onPress={handleBackHome}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>RUN COMPLETE</Text>
          <Text style={styles.headerDate}>{formatDateTime(run.startTime || run.date)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Map Route Preview */}
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

        {/* Big Key Stats */}
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
              label="Time"
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
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.mainButton, isSaved ? styles.savedButton : styles.saveButton]}
            onPress={handleSaveRun}
            disabled={isSaving}
          >
            <Ionicons
              name={isSaved ? 'checkmark-circle' : 'save-outline'}
              size={22}
              color="#0F172A"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.mainButtonText}>
              {isSaved ? 'SAVED TO HISTORY' : isSaving ? 'SAVING...' : 'SAVE RUN'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.secondaryButton, styles.runAgainButton]}
              onPress={handleRunAgain}
            >
              <Ionicons name="reload" size={18} color="#38BDF8" style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryButtonText, { color: '#38BDF8' }]}>RUN AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.secondaryButton, styles.backHomeButton]}
              onPress={handleBackHome}
            >
              <Ionicons name="home-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryButtonText, { color: '#94A3B8' }]}>BACK HOME</Text>
            </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
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
  headerDate: {
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
    height: SCREEN_HEIGHT * 0.38,
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
  actionSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  mainButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  savedButton: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  runAgainButton: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  backHomeButton: {
    borderColor: '#334155',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
