import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const StatCard = ({ title, value, style }) => {
  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: Layout.spacing.lg,
  },
  title: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default StatCard;


