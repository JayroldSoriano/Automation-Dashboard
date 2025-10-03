import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const statusToColor = {
  confirmed: Colors.success,
  completed: Colors.secondary,
  cancelled: Colors.error,
  default: Colors.border,
};

const StatusBadge = ({ status = 'default', label }) => {
  const normalized = String(status || 'default').toLowerCase();
  const backgroundColor = statusToColor[normalized] || statusToColor.default;
  return (
    <View style={[styles.badge, { backgroundColor }]}> 
      <Text style={styles.text}>{label || status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;


