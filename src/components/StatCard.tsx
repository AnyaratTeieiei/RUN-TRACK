import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  style?: ViewStyle;
  isLarge?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  iconName,
  accentColor = '#10B981',
  style,
  isLarge = false,
}) => {
  return (
    <View style={[styles.card, isLarge && styles.cardLarge, style]}>
      <View style={styles.headerRow}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={isLarge ? 18 : 15}
            color={accentColor}
            style={styles.icon}
          />
        )}
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            isLarge && styles.valueLarge,
            { color: '#F8FAFC' },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        {unit && <Text style={[styles.unit, { color: accentColor }]}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardLarge: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  valueLarge: {
    fontSize: 38,
    letterSpacing: -1,
  },
  unit: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
});
