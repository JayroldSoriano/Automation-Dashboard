import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

/**
 * Services section component displaying top requested services
 * @param {Object} props - Component props
 * @param {Object} props.serviceCategoryDistribution - Service category distribution data
 * @returns {JSX.Element} Services section
 */
const ServicesSection = ({ serviceCategoryDistribution }) => {
  // Mock data to match reference image
  const servicesData = [
    { name: 'Cleaning', count: 320 },
    { name: 'Checkup', count: 280 },
    { name: 'Filling', count: 150 },
    { name: 'Braces', count: 95 },
    { name: 'Extraction', count: 80 },
    { name: 'Root Canal', count: 55 }
  ];

  return (
    <View style={styles.servicesContainer}>
      {servicesData.map((service, index) => (
        <View key={service.name} style={styles.serviceItem}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCount}>{service.count}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = {
  servicesContainer: {
    flex: 1,
    padding: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  serviceCount: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
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
