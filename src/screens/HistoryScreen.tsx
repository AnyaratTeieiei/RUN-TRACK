import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RunRecord, RootStackParamList } from '../types/run';
import { storageService } from '../services/storageService';
import { formatDate, formatTimer } from '../utils/timeFormatter';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadHistory = async () => {
    try {
      const history = await storageService.getAllRuns();
      setRuns(history);
    } catch (error) {
      console.error('Failed to load runs history:', error);
    }
  };

  // Reload history whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  const handleSelectRun = (run: RunRecord) => {
    navigation.navigate('RunDetail', { run });
  };

  const renderRunItem = ({ item }: { item: RunRecord }) => {
    const formattedRunNumber = item.runNumber
      ? item.runNumber < 10
        ? `0${item.runNumber}`
        : item.runNumber
      : '01';

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.card}
        onPress={() => handleSelectRun(item)}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.runBadge}>
            <Text style={styles.runBadgeText}>RUN #{formattedRunNumber}</Text>
          </View>
          <Text style={styles.runDate}>{formatDate(item.startTime || item.date)}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.distance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>KM</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTimer(item.duration)}</Text>
            <Text style={styles.statLabel}>TIME</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.averagePace}</Text>
            <Text style={styles.statLabel}>MIN/KM</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#475569" style={styles.chevron} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>RUNNING HISTORY</Text>
          <Text style={styles.headerSubtitle}>
            {runs.length} {runs.length === 1 ? 'WORKOUT' : 'WORKOUTS'} RECORDED
          </Text>
        </View>
      </View>

      {/* Runs List */}
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        renderItem={renderRunItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="footsteps-outline" size={48} color="#475569" />
            </View>
            <Text style={styles.emptyTitle}>No Runs Recorded Yet</Text>
            <Text style={styles.emptySubtitle}>
              Hit START RUN on the Home screen to begin your first tracked workout!
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  runBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  runBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  runDate: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
    marginRight: 14,
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
