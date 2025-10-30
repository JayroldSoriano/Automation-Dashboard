import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const PATIENT_TABLE_COLUMNS = ['PROFILE', 'NAME', 'AGE', 'GENDER', 'PHONE', 'EMAIL', 'LOCATION', 'PLATFORM', 'JOINED'];

const PatientSection = ({ patients = [], onRowPress }) => {
  console.log('PatientSection received patients:', patients?.length || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  const renderTableData = () => {
    return patients.map((patient, index) => {
      const patientKey = `${patient.id || patient.name}-${index}`;
      
      return {
        key: patientKey,
        data: [
          // Profile Picture
          patient.profilepicture ? (
            <Image 
              source={{ uri: patient.profilepicture }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <MaterialIcons name="person" size={20} color={Colors.textSecondary} />
            </View>
          ),
          <Text style={styles.cellPrimary}>{patient.name || '—'}</Text>, // Name
          <Text style={styles.cellSecondary}>{patient.age || '—'}</Text>, // Age
          <Text style={styles.cellSecondary}>{patient.gender || '—'}</Text>, // Gender
          <Text style={styles.cellSecondary}>{patient.phone || '—'}</Text>, // Phone
          <Text style={styles.cellDescription} numberOfLines={1}>{patient.email || '—'}</Text>, // Email
          <Text style={styles.cellSecondary}>{patient.location || '—'}</Text>, // Location
          <Text style={styles.cellSecondary}>{patient.platform || '—'}</Text>, // Platform
          <Text style={styles.cellDate}>{formatDate(patient.created_at)}</Text>, // Joined Date
        ],
        patient
      };
    });
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {PATIENT_TABLE_COLUMNS.map((col, colIndex) => {
          let cellStyle = styles.cell;
          if (colIndex === 0) cellStyle = [styles.cell, styles.profileCell]; // Profile
          else if (colIndex === 1) cellStyle = [styles.cell, styles.nameCell]; // Name
          else if (colIndex === 2) cellStyle = [styles.cell, styles.ageCell]; // Age
          else if (colIndex === 3) cellStyle = [styles.cell, styles.genderCell]; // Gender
          else if (colIndex === 4) cellStyle = [styles.cell, styles.phoneCell]; // Phone
          else if (colIndex === 5) cellStyle = [styles.cell, styles.emailCell]; // Email
          else if (colIndex === 6) cellStyle = [styles.cell, styles.locationCell]; // Location
          else if (colIndex === 7) cellStyle = [styles.cell, styles.platformCell]; // Platform
          else if (colIndex === 8) cellStyle = [styles.cell, styles.joinedCell]; // Joined
          
          return (
            <View key={col} style={cellStyle}>
              <Text style={styles.headerText}>{col.toUpperCase()}</Text>
            </View>
          );
        })}
      </View>

      {/* Table Body */}
      <ScrollView 
        style={styles.tableBody}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {renderTableData().map((rowData, rowIndex) => (
          <TouchableOpacity
            key={`row-${rowIndex}`}
            style={[
              styles.tableRow,
              rowIndex === renderTableData().length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={() => onRowPress && onRowPress(rowData.patient)}
            activeOpacity={0.7}
          >
            {rowData.data.map((cell, colIndex) => {
              let cellStyle = styles.cell;
              if (colIndex === 0) cellStyle = [styles.cell, styles.profileCell]; // Profile
              else if (colIndex === 1) cellStyle = [styles.cell, styles.nameCell]; // Name
              else if (colIndex === 2) cellStyle = [styles.cell, styles.ageCell]; // Age
              else if (colIndex === 3) cellStyle = [styles.cell, styles.genderCell]; // Gender
              else if (colIndex === 4) cellStyle = [styles.cell, styles.phoneCell]; // Phone
              else if (colIndex === 5) cellStyle = [styles.cell, styles.emailCell]; // Email
              else if (colIndex === 6) cellStyle = [styles.cell, styles.locationCell]; // Location
              else if (colIndex === 7) cellStyle = [styles.cell, styles.platformCell]; // Platform
              else if (colIndex === 8) cellStyle = [styles.cell, styles.joinedCell]; // Joined
              
              return (
                <View key={`cell-${colIndex}`} style={cellStyle}>
                  {cell}
                </View>
              );
            })}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = {
  tableContainer: {
    backgroundColor: '#121e23', // table bg
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
    height: 500, // Fixed height for the table
    width: '100%', // Full width
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#172131', // header bg
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%', // Full width
  },
  headerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  tableBody: {
    backgroundColor: '#111d22',
    height: 436, // Fixed height for scrollable body (500 - 64 header height)
    width: '100%', // Full width
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2b3a4c', // subtle separator line
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%', // Full width
  },
  cell: {
    flex: 1,
  },
  profileCell: {
    flex: 0.8, // Profile picture gets less space
  },
  nameCell: {
    flex: 1.5, // Name gets more space
  },
  ageCell: {
    flex: 0.6, // Age gets less space
  },
  genderCell: {
    flex: 0.8, // Gender gets standard space
  },
  phoneCell: {
    flex: 1.2, // Phone gets more space
  },
  emailCell: {
    flex: 2, // Email gets the most space
  },
  locationCell: {
    flex: 1.2, // Location gets more space
  },
  platformCell: {
    flex: 1, // Platform gets standard space
  },
  joinedCell: {
    flex: 1, // Joined date gets standard space
  },
  cellPrimary: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cellSecondary: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  cellDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  cellDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default PatientSection;
