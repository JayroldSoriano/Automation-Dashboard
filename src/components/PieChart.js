import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
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

const defaultColors = [Colors.primary, Colors.secondary, Colors.success, Colors.warning, Colors.error, '#0CA9F2', '#8E8E93'];

const PieChart = ({ data = [], size = 120, strokeWidth = 0, labels = [], legend = true, title, colors }) => {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const total = data.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) || 1;

  let startAngle = 0;
  const palette = Array.isArray(colors) && colors.length > 0 ? colors : defaultColors;
  const slices = data.map((value, index) => {
    const pct = (value / total) * 100;
    const sweep = (pct / 100) * 360;
    const endAngle = startAngle + sweep;
    const path = describeArc(cx, cy, radius, startAngle, endAngle);
    const color = palette[index % palette.length];
    const result = { path, color, value, pct: Math.round(pct) };
    startAngle = endAngle;
    return result;
  });

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Svg width={size} height={size}>
        <G>
          {slices.map((s, idx) => (
            <Path key={idx} d={s.path} fill={s.color} strokeWidth={strokeWidth} />
          ))}
        </G>
      </Svg>
      {legend && labels && labels.length > 0 ? (
        <View style={styles.legend}>
          {labels.map((label, idx) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: palette[idx % palette.length] }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  legend: {
    marginTop: Layout.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Layout.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default PieChart;


