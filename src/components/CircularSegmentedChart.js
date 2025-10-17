import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y, 'L', cx, cy, 'Z'].join(' ');
}

const CircularSegmentedChart = ({ 
  data = [], 
  labels = [], 
  colors = [], 
  title, 
  size = 120,
  centerIcon = null,
  centerValue = null,
  centerLabel = null
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

  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const innerRadius = radius * 0.6; // Inner radius for the donut effect

  let startAngle = 0;
  const palette = Array.isArray(colors) && colors.length > 0 ? colors : [Colors.primary, Colors.secondary, Colors.success, Colors.warning, Colors.error];
  
  const segments = data.map((value, index) => {
    const pct = (value / total) * 100;
    const sweep = (pct / 100) * 360;
    const endAngle = startAngle + sweep;
    
    // Create outer arc
    const outerPath = describeArc(cx, cy, radius, startAngle, endAngle);
    // Create inner arc (reversed for donut effect)
    const innerPath = describeArc(cx, cy, innerRadius, endAngle, startAngle);
    // Combine paths
    const path = `${outerPath} ${innerPath} Z`;
    
    const color = palette[index % palette.length];
    const result = { path, color, value, pct: Math.round(pct), label: labels[index] || `Item ${index + 1}` };
    startAngle = endAngle;
    return result;
  });

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G>
            {segments.map((s, idx) => (
              <Path key={idx} d={s.path} fill={s.color} />
            ))}
          </G>
        </Svg>
        
        {/* Center Content */}
        <View style={styles.centerContent}>
          {centerIcon && (
            <View style={styles.centerIcon}>
              {centerIcon}
            </View>
          )}
          {centerValue && (
            <Text style={styles.centerValue}>{centerValue.toLocaleString()}</Text>
          )}
          {centerLabel && (
            <Text style={styles.centerLabel}>{centerLabel}</Text>
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendValue}>{segment.value.toLocaleString()}</Text>
            <Text style={styles.legendPercentage}>{segment.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    marginBottom: 4,
  },
  centerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  centerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  legend: {
    gap: 4,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  legendValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 6,
    minWidth: 40,
    textAlign: 'right',
  },
  legendPercentage: {
    fontSize: 11,
    color: Colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  emptyState: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default CircularSegmentedChart;

