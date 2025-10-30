import React from 'react';
import { View, Text } from 'react-native';
import HorizontalSegmentedBar from '../HorizontalSegmentedBar';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { processServiceCategoryDistribution } from '../../utils/dataUtils';

const ServiceCategorySection = ({ serviceCategoryDistribution }) => {
  const processedData = processServiceCategoryDistribution(serviceCategoryDistribution);
  
  if (!processedData.hasData) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No service data available</Text>
      </View>
    );
  }

  // Limit to top 10 service categories
  const top10Data = {
    data: processedData.data.slice(0, 10),
    labels: processedData.labels.slice(0, 10),
    colors: processedData.colors.slice(0, 10),
    hasData: processedData.hasData
  };

  return (
    <View style={styles.serviceContainer}>
      <HorizontalSegmentedBar
        data={top10Data.data}
        labels={top10Data.labels}
        colors={top10Data.colors}
        title="Top 10 Service Categories"
        showHighlight={true}
        showValues={true}
        showLabels={false}
      />
    </View>
  );
};

const styles = {
  serviceContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
};

export default ServiceCategorySection;
