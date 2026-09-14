import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { ProfileStats } from '../types/run';
import { storageService } from '../services/storageService';
import { formatTotalTime } from '../utils/timeFormatter';
import { StatCard } from '../components/StatCard';

export const ProfileScreen: React.FC = () => {
  const [stats, setStats] = useState<ProfileStats>({
    totalRuns: 0,
    totalDistance: 0,
    totalTime: 0,
    averagePace: '--:--',
    longestDistance: 0,
    bestPace: '--:--',
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadStats = async () => {
    try {
      const data = await storageService.getProfileStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load profile stats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  };

  // Determine runner level based on total distance
  const getRunnerBadge = () => {
    if (stats.totalDistance >= 100) return { title: 'Marathon Legend', level: 'ELITE' };
    if (stats.totalDistance >= 50) return { title: 'Endurance Runner', level: 'ADVANCED' };
    if (stats.totalDistance >= 20) return { title: 'Pacesetter', level: 'INTERMEDIATE' };
    if (stats.totalDistance >= 5) return { title: 'Road Runner', level: 'ACTIVE' };
    return { title: 'Beginner Runner', level: 'STARTER' };
  };

  const badge = getRunnerBadge();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ATHLETE PROFILE</Text>
        <Text style={styles.headerSubtitle}>LIFETIME PERFORMANCE</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Athlete Banner Card */}
        <View style={styles.athleteCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color="#10B981" />
          </View>

          <View style={styles.athleteInfo}>
            <Text style={styles.athleteName}>RUN TRACK ATHLETE</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badgeContainer}>
                <Ionicons name="medal" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>{badge.title}</Text>
              </View>
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>{badge.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Primary Lifetime Metrics */}
        <Text style={styles.sectionTitle}>LIFETIME TOTALS</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Total Runs"
              value={stats.totalRuns}
              iconName="footsteps"
              accentColor="#38BDF8"
              style={{ flex: 1, marginRight: 8 }}
              isLarge={true}
            />
            <StatCard
              label="Total Distance"
              value={stats.totalDistance.toFixed(2)}
              unit="KM"
              iconName="navigate"
              accentColor="#10B981"
              style={{ flex: 1, marginLeft: 8 }}
              isLarge={true}
            />
          </View>

          <View style={[styles.statsRow, { marginTop: 12 }]}>
            <StatCard
              label="Total Time"
              value={formatTotalTime(stats.totalTime)}
              iconName="time"
              accentColor="#F59E0B"
              style={{ flex: 1, marginRight: 8 }}
            />
            <StatCard
              label="Average Pace"
              value={stats.averagePace}
              unit="MIN/KM"
              iconName="speedometer"
              accentColor="#EC4899"
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>

        {/* Personal Bests Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>PERSONAL BESTS</Text>

        <View style={styles.bestsContainer}>
          <View style={styles.bestCard}>
            <View style={styles.bestIconBox}>
              <Ionicons name="ribbon" size={24} color="#F59E0B" />
            </View>
            <View style={styles.bestDetails}>
              <Text style={styles.bestLabel}>LONGEST DISTANCE</Text>
              <Text style={styles.bestValue}>
                {stats.longestDistance > 0 ? `${stats.longestDistance.toFixed(2)} km` : '--'}
              </Text>
            </View>
          </View>

          <View style={[styles.bestCard, { marginTop: 10 }]}>
            <View style={[styles.bestIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="flash" size={24} color="#10B981" />
            </View>
            <View style={styles.bestDetails}>
              <Text style={styles.bestLabel}>FASTEST AVERAGE PACE</Text>
              <Text style={styles.bestValue}>
                {stats.bestPace !== '--:--' ? `${stats.bestPace} min/km` : '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* App Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>
            GPS accuracy filtering and real-time Haversine distance engine active.
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    marginRight: 16,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  levelContainer: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  statsGrid: {
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  bestsContainer: {
    marginBottom: 16,
  },
  bestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bestIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bestDetails: {
    flex: 1,
  },
  bestLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  bestValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
