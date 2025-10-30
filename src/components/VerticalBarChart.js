import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const VerticalBarChart = ({ data = [], labels = [], colors = [], title, maxValue = null }) => {
  // Calculate the maximum value for scaling
  const dataMax = maxValue || Math.max(...data, 1);
  
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.chartContainer}>
        {data.map((value, index) => {
          const percentage = dataMax > 0 ? (value / dataMax) * 100 : 0;
          const color = colors[index % colors.length] || Colors.primary;
          const label = labels[index] || `Item ${index + 1}`;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View style={[styles.barTrack, { backgroundColor: Colors.background }]}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${percentage}%`, 
                        backgroundColor: color 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barValue}>{value}</Text>
              </View>
              <Text style={styles.barLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: Layout.spacing.xs,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  barTrack: {
    width: 20,
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
    minHeight: 2, // Ensure minimum visibility even for very small values
  },
  barValue: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 40,
  },
});

export default VerticalBarChart;

