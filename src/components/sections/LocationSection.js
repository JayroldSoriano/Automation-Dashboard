import React from 'react';
import { View, Text } from 'react-native';
import { processLocationDistribution } from '../../utils/dataUtils';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

/**
 * Location distribution section component
 * @param {Object} props - Component props
 * @param {Object} props.locationDistribution - Location distribution data
 * @returns {JSX.Element} Location section
 */
const LocationSection = ({ locationDistribution }) => {
  const locationData = processLocationDistribution(locationDistribution);

  if (!locationData.hasData) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No location data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.locationContainer}>
      {locationData.locations.map(([location, count], index) => {
        const percentage = locationData.totalPatients > 0 
          ? Math.round((count / locationData.totalPatients) * 100) 
          : 0;
        
        return (
          <View key={location} style={styles.locationRow}>
            <View style={styles.locationPlaceContainer}>
              <Text style={styles.locationPlaceText}>
                {index + 1}. {location}
              </Text>
            </View>
            <View style={styles.locationStatsContainer}>
              <Text style={styles.locationCountText}>{count} patients</Text>
              <Text style={styles.locationPercentageText}>({percentage}%)</Text>
            </View>
          </View>
        );
      })}
      <View style={styles.locationTotalRow}>
        <Text style={styles.locationTotalText}>
          Total: {locationData.totalPatients} patients
        </Text>
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
  locationContainer: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  locationPlaceContainer: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  locationPlaceText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  locationStatsContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  locationCountText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  locationPercentageText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locationTotalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  locationTotalText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
};

export default LocationSection;
