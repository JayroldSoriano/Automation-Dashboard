import React from 'react';
import { View, Text } from 'react-native';
import HorizontalSegmentedBar from '../HorizontalSegmentedBar';
import { Colors } from '../../constants/Colors';
import { processAgeDistribution, processGenderDistribution } from '../../utils/dataUtils';

/**
 * Demographics section component displaying age and gender distribution
 * @param {Object} props - Component props
 * @param {Object} props.ageDistribution - Age distribution data
 * @param {Object} props.genderDistribution - Gender distribution data
 * @returns {JSX.Element} Demographics section
 */
const DemographicsSection = ({ ageDistribution, genderDistribution }) => {
  const ageData = processAgeDistribution(ageDistribution);
  const genderData = processGenderDistribution(genderDistribution);
  const ageLabels = ['0-18', '19-35', '36-55', '56+'];
  const ageColors = ['#4A90E2', '#5BA0F2', '#6BB0FF', '#7BC0FF'];
  const formattedAgeLabels = ageLabels.map((label, index) => {
    const value = ageData.data[index] || 0;
    const pct = ageData.total > 0 ? Math.round((value / ageData.total) * 100) : 0;
    return (
      <View key={`age-${label}`}>
        <Text style={styles.dominantLabel}>{label}</Text>
        <Text style={styles.secondaryLabel}>{`${value} (${pct}%)`}</Text>
      </View>
    );
  });
  const baseGenderLabels = ['Male', 'Female', 'Other'];
  const formattedGenderLabels = baseGenderLabels.map((label, index) => {
    const value = genderData.data[index] || 0;
    const pct = genderData.total > 0 ? Math.round((value / genderData.total) * 100) : 0;
    return (
      <View key={`gender-${label}`}>
        <Text style={styles.dominantLabel}>{label}</Text>
        <Text style={styles.secondaryLabel}>{`${value} (${pct}%)`}</Text>
      </View>
    );
  });

  return (
    <View style={styles.demographicsContainer}>
      {/* Age Distribution */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Age Distribution</Text>
        <HorizontalSegmentedBar 
          data={ageData.data} 
          labels={formattedAgeLabels} 
          colors={ageColors}
          showLabels={true}
          showValues={false}
          showHighlight={false}
          barLabelStyle={styles.dominantLabel}
        />
      </View>
      
      {/* Gender Distribution */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Gender Distribution</Text>
        <HorizontalSegmentedBar 
          data={genderData.data} 
          labels={formattedGenderLabels} 
          colors={['#2ECC71', '#27AE60', '#1E8449']}
          showLabels={true}
          showValues={false}
          showHighlight={false}
          barLabelStyle={styles.dominantLabel}
        />
      </View>
    </View>
  );
};

const styles = {
  demographicsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  demographicsRow: {
    flexDirection: 'column',
    gap: 24, // Layout.spacing.lg
  },
  demographicBlockCentered: {
    backgroundColor: '#F2F2F7', // Colors.background
    borderRadius: 8, // Layout.borderRadius.md
    padding: 16, // Layout.spacing.md
  },
  dominantLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
};

export default DemographicsSection;
