import React from 'react';
import { View, Text } from 'react-native';
import CircularSegmentedChart from '../CircularSegmentedChart';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { processPlatformDistribution } from '../../utils/dataUtils';

const PlatformSection = ({ platformDistribution }) => {
  const processedData = processPlatformDistribution(platformDistribution);
  
  const platformData = {
    hasData: processedData.hasData,
    data: processedData.data || [],
    labels: processedData.labels || [],
    colors: processedData.colors || [],
    items: processedData.labels?.map((label, index) => ({
      name: label,
      value: processedData.data[index] || 0
    })) || [],
  };

  if (!platformData.hasData) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No platform data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.platformContainer}>
      <CircularSegmentedChart
        data={platformData.data}
        labels={platformData.labels}
        colors={platformData.colors}
        size={200}
        donut={true}
        donutRadius={0.65} // perfect hollow circle ratio
        showCenterValue={false}
        showLegend={false}
      />

      <View style={styles.legendRow}>
        {platformData.items.map((item, index) => {
          const total = platformData.items.reduce((sum, it) => sum + it.value, 0);
          const pct = Math.round((item.value / total) * 100);
          return (
            <View key={item.name} style={styles.legendBlock}>
              <View style={styles.legendInner}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: platformData.colors[index] },
                  ]}
                />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendName}>{item.name}</Text>
                  <Text style={styles.legendNumbers}>{`${item.value} (${pct}%)`}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = {
  emptyStateContainer: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  platformContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  legendRow: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  legendBlock: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    alignSelf: 'center',
  },
  legendTextContainer: {
    alignItems: 'center',
  },
  legendName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  legendNumbers: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
};

export default PlatformSection;
