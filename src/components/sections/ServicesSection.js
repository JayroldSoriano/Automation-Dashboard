import React from 'react';
import { View, Text } from 'react-native';
import HorizontalSegmentedBar from '../HorizontalSegmentedBar';
import { processServiceCategoryDistribution } from '../../utils/dataUtils';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

/**
 * Services section component displaying service category distribution
 * @param {Object} props - Component props
 * @param {Object} props.serviceCategoryDistribution - Service category distribution data
 * @returns {JSX.Element} Services section
 */
const ServicesSection = ({ serviceCategoryDistribution }) => {
  const serviceData = processServiceCategoryDistribution(serviceCategoryDistribution);

  if (!serviceData.hasData) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No service data available</Text>
      </View>
    );
  }

  return (
    <HorizontalSegmentedBar 
      title={`All Service Categories (${serviceData.total} appointments)`} 
      data={serviceData.data} 
      labels={serviceData.labels} 
      colors={serviceData.colors}
      highlightIndex={serviceData.maxIndex}
      showHighlight={serviceData.total > 0}
    />
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
};

export default ServicesSection;
