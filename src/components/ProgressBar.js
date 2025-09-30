import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const ProgressBar = ({ label, value = 0, color = Colors.primary }) => {
  const progress = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.percent}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.sm,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  track: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  percent: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
    alignSelf: 'flex-end',
  },
});

export default ProgressBar;


