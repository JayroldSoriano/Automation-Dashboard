import React from 'react';
import { View, Text } from 'react-native';
import CircularSegmentedChart from '../CircularSegmentedChart';
import { processPlatformDistribution } from '../../utils/dataUtils';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

/**
 * Platform usage section component displaying platform distribution
 * @param {Object} props - Component props
 * @param {Object} props.platformDistribution - Platform distribution data
 * @returns {JSX.Element} Platform section
 */
const PlatformSection = ({ platformDistribution }) => {
  const platformData = processPlatformDistribution(platformDistribution);

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
        title="Platform Distribution" 
        data={platformData.data} 
        labels={platformData.labels} 
        colors={platformData.colors}
        size={200}
        centerValue={platformData.total}
        centerLabel="Total Patients"
        donut={true}
        donutRadius={0.6}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
    height: '100%',
    minHeight: 280,
  },
};

export default PlatformSection;
