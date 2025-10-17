import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const HorizontalSegmentedBar = ({ 
  data = [], 
  labels = [], 
  colors = [], 
  title, 
  highlightIndex = 0,
  showHighlight = true 
}) => {
  const total = data.reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const segments = data.map((value, index) => {
    const percentage = (value / total) * 100;
    const color = colors[index % colors.length] || Colors.primary;
    return {
      value,
      percentage,
      color,
      label: labels[index] || `Item ${index + 1}`,
      isHighlighted: index === highlightIndex && showHighlight
    };
  });

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      
      {/* Horizontal Segmented Bar */}
      <View style={styles.barContainer}>
        <View style={styles.bar}>
          {segments.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: `${segment.percentage}%`,
                  backgroundColor: segment.color,
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Highlighted Category Information */}
      {showHighlight && segments[highlightIndex] && (
        <View style={styles.highlightInfo}>
          <View style={styles.highlightRow}>
            <View style={[styles.colorDot, { backgroundColor: segments[highlightIndex].color }]} />
            <Text style={styles.highlightLabel}>{segments[highlightIndex].label}</Text>
            <Text style={styles.highlightValue}>{segments[highlightIndex].value.toLocaleString()}</Text>
            <Text style={styles.highlightPercentage}>
              {Math.round(segments[highlightIndex].percentage)}%
            </Text>
          </View>
        </View>
      )}

      {/* All Categories Legend */}
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendValue}>{segment.value}</Text>
            <Text style={styles.legendPercentage}>{Math.round(segment.percentage)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  barContainer: {
    marginBottom: Layout.spacing.sm,
  },
  bar: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segment: {
    height: '100%',
  },
  highlightInfo: {
    marginBottom: Layout.spacing.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  highlightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  highlightPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  legend: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 6,
    minWidth: 30,
    textAlign: 'right',
  },
  legendPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  emptyState: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default HorizontalSegmentedBar;
