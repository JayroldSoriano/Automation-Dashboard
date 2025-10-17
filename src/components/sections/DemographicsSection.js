import React from 'react';
import { View } from 'react-native';
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

  return (
    <View style={styles.demographicsRow}>
      <View style={styles.demographicBlockCentered}>
        <HorizontalSegmentedBar 
          title={`Age Distribution (${ageData.total} patients)`} 
          data={ageData.data} 
          labels={ageData.labels} 
          colors={[Colors.primary, Colors.secondary, Colors.success, Colors.warning]}
          highlightIndex={ageData.maxIndex}
          showHighlight={ageData.hasData}
        />
      </View>
      
      <View style={styles.demographicBlockCentered}>
        <HorizontalSegmentedBar 
          title={`Gender Distribution (${genderData.total} patients)`} 
          data={genderData.data} 
          labels={genderData.labels} 
          colors={[Colors.primary, Colors.pink, Colors.success]}
          highlightIndex={genderData.maxIndex}
          showHighlight={genderData.hasData}
        />
      </View>
    </View>
  );
};

const styles = {
  demographicsRow: {
    flexDirection: 'column',
    gap: 24, // Layout.spacing.lg
  },
  demographicBlockCentered: {
    backgroundColor: '#F2F2F7', // Colors.background
    borderRadius: 8, // Layout.borderRadius.md
    padding: 16, // Layout.spacing.md
  },
};

export default DemographicsSection;
