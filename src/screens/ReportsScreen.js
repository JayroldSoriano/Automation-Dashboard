import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const ReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Analytics and exportable summaries will appear here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default ReportsScreen;


