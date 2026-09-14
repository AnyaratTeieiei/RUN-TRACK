import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GPSStatusType } from '../types/run';

interface GPSStatusProps {
  status: GPSStatusType;
  onPress?: () => void;
}

export const GPSStatus: React.FC<GPSStatusProps> = ({ status, onPress }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ready':
        return {
          label: 'GPS Ready',
          color: '#10B981', // Emerald green
          bgColor: 'rgba(16, 185, 129, 0.15)',
          icon: 'location' as const,
        };
      case 'searching':
        return {
          label: 'Searching GPS...',
          color: '#F59E0B', // Amber
          bgColor: 'rgba(245, 158, 11, 0.15)',
          icon: 'navigate-outline' as const,
        };
      case 'weak':
        return {
          label: 'GPS Signal Weak',
          color: '#F97316', // Orange
          bgColor: 'rgba(249, 115, 22, 0.15)',
          icon: 'warning-outline' as const,
        };
      case 'disabled':
        return {
          label: 'GPS Disabled',
          color: '#EF4444', // Red
          bgColor: 'rgba(239, 68, 68, 0.15)',
          icon: 'location-outline' as const,
        };
      case 'permission_denied':
      default:
        return {
          label: 'GPS Permission Required',
          color: '#EF4444', // Red
          bgColor: 'rgba(239, 68, 68, 0.15)',
          icon: 'alert-circle-outline' as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={status === 'ready'}
      style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.color }]}
    >
      <View style={[styles.indicatorDot, { backgroundColor: config.color }]} />
      <Ionicons name={config.icon} size={14} color={config.color} style={styles.icon} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
