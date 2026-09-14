import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TrackingState = 'idle' | 'running' | 'paused';

interface RunButtonProps {
  state: TrackingState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}

export const RunButton: React.FC<RunButtonProps> = ({
  state,
  onStart,
  onPause,
  onResume,
  onFinish,
}) => {
  if (state === 'idle') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.bigButton, styles.startButton]}
          onPress={onStart}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="play" size={26} color="#0F172A" />
            </View>
            <Text style={styles.startButtonText}>START RUN</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.dualContainer}>
      {state === 'running' ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.splitButton, styles.pauseButton]}
          onPress={onPause}
        >
          <Ionicons name="pause" size={24} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.splitButtonText}>PAUSE</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.splitButton, styles.resumeButton]}
          onPress={onResume}
        >
          <Ionicons name="play" size={24} color="#0F172A" style={styles.btnIcon} />
          <Text style={[styles.splitButtonText, { color: '#0F172A' }]}>RESUME</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.splitButton, styles.finishButton]}
        onPress={onFinish}
      >
        <Ionicons name="flag" size={24} color="#FFFFFF" style={styles.btnIcon} />
        <Text style={styles.splitButtonText}>FINISH</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bigButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#10B981', // Sporty vibrant emerald
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  dualContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  splitButton: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  resumeButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  finishButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  btnIcon: {
    marginRight: 8,
  },
  splitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
