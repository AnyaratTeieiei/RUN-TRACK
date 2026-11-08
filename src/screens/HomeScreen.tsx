import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { AppMapView, AppMapViewRef } from '../components/Map';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GPSCoordinate, GPSStatusType, RootStackParamList } from '../types/run';
import { locationService } from '../services/locationService';
import {
  calculateHaversineDistance,
  isValidCoordinate,
} from '../utils/distanceCalculator';
import { calculatePace, calculateAverageSpeed, convertMpsToKmh } from '../utils/paceCalculator';
import { formatTimer } from '../utils/timeFormatter';
import { GPSStatus } from '../components/GPSStatus';
import { StatCard } from '../components/StatCard';
import { RunButton, TrackingState } from '../components/RunButton';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<AppMapViewRef | null>(null);

  // GPS & Tracking States
  const [gpsStatus, setGpsStatus] = useState<GPSStatusType>('searching');
  const [currentCoord, setCurrentCoord] = useState<GPSCoordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<GPSCoordinate[]>([]);
  const [trackingState, setTrackingState] = useState<TrackingState>('idle');
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(true);
  const [lowAccuracyWarning, setLowAccuracyWarning] = useState<boolean>(false);

  // Running Metrics States
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [currentPace, setCurrentPace] = useState<string>('--:--');

  // Refs for tracking subscription & interval
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const routeRef = useRef<GPSCoordinate[]>([]);
  const lastValidCoordRef = useRef<GPSCoordinate | null>(null);
  const totalDistanceRef = useRef<number>(0);
  const elapsedSecondsRef = useRef<number>(0);

  // Synchronize refs with state for callbacks
  useEffect(() => {
    routeRef.current = routeCoordinates;
  }, [routeCoordinates]);

  useEffect(() => {
    totalDistanceRef.current = totalDistanceKm;
  }, [totalDistanceKm]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Initial Location Check and Permission Request
  useEffect(() => {
    checkInitialPermissions();

    return () => {
      stopTrackingSubscription();
      stopTimer();
    };
  }, []);

  const checkInitialPermissions = async () => {
    setGpsStatus('searching');
    const hasPermission = await locationService.checkPermissions();

    if (!hasPermission) {
      const granted = await locationService.requestPermissions();
      if (!granted) {
        setGpsStatus('permission_denied');
        return;
      }
    }

    const isGpsOn = await locationService.isGPSEnabled();
    if (!isGpsOn) {
      setGpsStatus('disabled');
      return;
    }

    // Fetch initial location to position the map
    const initialPos = await locationService.getCurrentPosition();
    if (initialPos) {
      setCurrentCoord(initialPos);
      setGpsStatus('ready');
      centerCamera(initialPos.latitude, initialPos.longitude);
    } else {
      setGpsStatus('weak');
    }
  };

  const centerCamera = (latitude: number, longitude: number, zoomLevel = 17) => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude, longitude },
        zoom: zoomLevel,
        pitch: 15,
        heading: 0,
        duration: 800,
      });
    }
  };

  // Timer Handlers
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;
        // Update pace as time advances
        const pace = calculatePace(totalDistanceRef.current, nextSec);
        setCurrentPace(pace);
        return nextSec;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopTrackingSubscription = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  };

  // Process incoming GPS coordinate
  const handleNewGPSCoordinate = useCallback((newCoord: GPSCoordinate) => {
    setCurrentCoord(newCoord);

    // Update GPS status according to accuracy
    if (newCoord.accuracy && newCoord.accuracy > 30) {
      setGpsStatus('weak');
      setLowAccuracyWarning(true);
    } else {
      setGpsStatus('ready');
      setLowAccuracyWarning(false);
    }

    // Update speed
    const speedKmh = convertMpsToKmh(newCoord.speed);
    setCurrentSpeedKmh(speedKmh);

    // Filter and accumulate coordinate
    const validation = isValidCoordinate(newCoord, lastValidCoordRef.current);

    if (validation.isValid) {
      lastValidCoordRef.current = newCoord;
      const addedKm = validation.distanceMeters / 1000;

      setTotalDistanceKm((prevKm) => {
        const updatedKm = prevKm + addedKm;
        const pace = calculatePace(updatedKm, elapsedSecondsRef.current);
        setCurrentPace(pace);
        return updatedKm;
      });

      setRouteCoordinates((prevRoute) => [...prevRoute, newCoord]);

      if (isFollowingUser) {
        centerCamera(newCoord.latitude, newCoord.longitude);
      }
    }
  }, [isFollowingUser]);

  // Action: START RUN
  const handleStartRun = async () => {
    // 1. Verify Permission
    const hasPermission = await locationService.checkPermissions();
    if (!hasPermission) {
      const granted = await locationService.requestPermissions();
      if (!granted) {
        setGpsStatus('permission_denied');
        Alert.alert(
          'Location Required',
          'Location permission is required to track your run. Please enable it in Settings.'
        );
        return;
      }
    }

    // 2. Verify GPS is ON
    const isGpsOn = await locationService.isGPSEnabled();
    if (!isGpsOn) {
      setGpsStatus('disabled');
      Alert.alert(
        'GPS Disabled',
        'Please enable Location Services (GPS) on your phone to track your run.'
      );
      return;
    }

    // 3. Reset stats
    setRouteCoordinates([]);
    setTotalDistanceKm(0);
    setElapsedSeconds(0);
    setCurrentSpeedKmh(0);
    setCurrentPace('--:--');
    lastValidCoordRef.current = null;
    startTimeRef.current = Date.now();
    setIsFollowingUser(true);

    // 4. Capture initial position
    const startPos = await locationService.getCurrentPosition();
    if (startPos) {
      setCurrentCoord(startPos);
      centerCamera(startPos.latitude, startPos.longitude);
      const validStart = isValidCoordinate(startPos, null).isValid;
      setGpsStatus(validStart ? 'ready' : 'weak');
      setLowAccuracyWarning(!validStart);
      if (validStart) {
        lastValidCoordRef.current = startPos;
        setRouteCoordinates([startPos]);
      }
    }

    // 5. Start GPS Watcher
    const sub = await locationService.watchPosition(
      (coord) => handleNewGPSCoordinate(coord),
      (err) => {
        console.warn('GPS Watch Error:', err);
        setGpsStatus('weak');
      }
    );

    if (sub) {
      locationSubRef.current = sub;
      setTrackingState('running');
      startTimer();
    } else {
      Alert.alert('GPS Error', 'Unable to start GPS tracking. Please check your signal.');
    }
  };

  // Action: PAUSE RUN
  const handlePauseRun = () => {
    setTrackingState('paused');
    stopTimer();
    stopTrackingSubscription();
  };

  // Action: RESUME RUN
  const handleResumeRun = async () => {
    const sub = await locationService.watchPosition(
      (coord) => handleNewGPSCoordinate(coord),
      (err) => console.warn('Resume GPS error:', err)
    );

    if (sub) {
      locationSubRef.current = sub;
      setTrackingState('running');
      startTimer();
    }
  };

  // Action: FINISH RUN
  const handleFinishRun = () => {
    Alert.alert('Finish Workout', 'Are you sure you want to finish this run?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        style: 'destructive',
        onPress: () => {
          stopTrackingSubscription();
          stopTimer();

          const finalDuration = elapsedSecondsRef.current;
          const finalDistance = Math.round(totalDistanceRef.current * 100) / 100;
          const finalAvgSpeed = calculateAverageSpeed(finalDistance, finalDuration);
          const finalAvgPace = calculatePace(finalDistance, finalDuration);

          const runRecord = {
            id: `run_${Date.now()}`,
            runNumber: 1,
            date: new Date().toISOString().split('T')[0],
            startTime: startTimeRef.current || Date.now() - finalDuration * 1000,
            endTime: Date.now(),
            duration: finalDuration,
            distance: finalDistance,
            averageSpeed: finalAvgSpeed,
            averagePace: finalAvgPace,
            coordinates: routeRef.current,
          };

          // Reset home state
          setTrackingState('idle');
          setRouteCoordinates([]);
          setTotalDistanceKm(0);
          setElapsedSeconds(0);
          setCurrentSpeedKmh(0);
          setCurrentPace('--:--');

          // Navigate to Summary Screen
          navigation.navigate('Summary', { run: runRecord });
        },
      },
    ]);
  };

  // Re-center on user
  const handleRecenter = () => {
    setIsFollowingUser(true);
    if (currentCoord) {
      centerCamera(currentCoord.latitude, currentCoord.longitude);
    } else {
      checkInitialPermissions();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>RUN TRACK</Text>
          <Text style={styles.headerSubtitle}>GPS RUNNING COMPANION</Text>
        </View>
        <GPSStatus status={gpsStatus} onPress={checkInitialPermissions} />
      </View>

      {/* Low Accuracy Banner Alert */}
      {lowAccuracyWarning && (
        <View style={styles.accuracyWarningBanner}>
          <Ionicons name="warning" size={16} color="#F97316" style={{ marginRight: 6 }} />
          <Text style={styles.accuracyWarningText}>
            GPS accuracy is low. Please wait for clear signal...
          </Text>
        </View>
      )}

      {/* Map View */}
      <View style={styles.mapWrapper}>
        <AppMapView
          ref={mapRef}
          style={styles.map}
          currentCoord={currentCoord}
          routeCoordinates={routeCoordinates}
          showStartMarker={true}
          showUserMarker={true}
          onTouchStart={() => setIsFollowingUser(false)}
        />

        {/* Floating "My Location" Re-center Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.recenterButton, isFollowingUser && styles.recenterButtonActive]}
          onPress={handleRecenter}
        >
          <Ionicons
            name={isFollowingUser ? 'locate' : 'locate-outline'}
            size={22}
            color={isFollowingUser ? '#10B981' : '#F8FAFC'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Dashboard / Running Statistics & Control Buttons */}
      <View style={styles.dashboardContainer}>
        {trackingState !== 'idle' && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                label="Distance"
                value={totalDistanceKm.toFixed(2)}
                unit="KM"
                iconName="navigate"
                accentColor="#10B981"
                style={{ flex: 1, marginRight: 8 }}
                isLarge={true}
              />
              <StatCard
                label="Time"
                value={formatTimer(elapsedSeconds)}
                iconName="time"
                accentColor="#38BDF8"
                style={{ flex: 1, marginLeft: 8 }}
                isLarge={true}
              />
            </View>

            <View style={[styles.statsRow, { marginTop: 10 }]}>
              <StatCard
                label="Pace"
                value={currentPace}
                unit="MIN/KM"
                iconName="speedometer"
                accentColor="#F59E0B"
                style={{ flex: 1, marginRight: 8 }}
              />
              <StatCard
                label="Speed"
                value={currentSpeedKmh.toFixed(1)}
                unit="KM/H"
                iconName="flash"
                accentColor="#EC4899"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        )}

        <RunButton
          state={trackingState}
          onStart={handleStartRun}
          onPause={handlePauseRun}
          onResume={handleResumeRun}
          onFinish={handleFinishRun}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Navy
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 10,
    backgroundColor: '#0F172A',
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: 2,
  },
  accuracyWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: '#F97316',
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  accuracyWarningText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '600',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  recenterButtonActive: {
    borderColor: '#10B981',
  },
  currentPositionMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPositionMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  startMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dashboardContainer: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 10 : 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  statsGrid: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
  },
});
