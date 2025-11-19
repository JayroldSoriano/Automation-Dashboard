import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import StatusBadge from '../StatusBadge';

const PatientSection = ({ patients = [], onRowPress, showBusiness = false, businessMap = {} }) => {
  console.log('PatientSection received patients:', patients?.length || 0);

  // Determine columns based on whether business info should be shown
  const PATIENT_TABLE_COLUMNS = useMemo(() => {
    const baseColumns = ['NAME', 'AGE', 'GENDER', 'PHONE', 'EMAIL', 'LOCATION', 'PLATFORM', 'STATUS', 'JOINED'];
    if (showBusiness) {
      // Insert BUSINESS column after NAME
      baseColumns.splice(1, 0, 'BUSINESS');
    }
    return baseColumns;
  }, [showBusiness]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBusinessName = (businessId) => {
    if (!businessId || !businessMap[businessId]) return '—';
    return businessMap[businessId].business_name || businessMap[businessId].email || '—';
  };


  const renderTableData = () => {
    return patients.map((patient, index) => {
      const patientKey = `${patient.id || patient.sender_id || patient.name}-${index}`;
      
      // Build data array based on columns
      const data = [
        <Text style={styles.cellPrimary}>{patient.name || '—'}</Text>, // Name
      ];

      // Add Business column if showBusiness is true
      if (showBusiness) {
        data.push(
          <Text style={styles.cellSecondary} numberOfLines={1}>
            {getBusinessName(patient.business_id)}
          </Text> // Business
        );
      }

      // Add remaining columns
      data.push(
        <Text style={styles.cellSecondary}>{patient.age || '—'}</Text>, // Age
        <Text style={styles.cellSecondary}>{patient.gender || '—'}</Text>, // Gender
        <Text style={styles.cellSecondary}>{patient.phone || '—'}</Text>, // Phone
        <Text style={styles.cellDescription} numberOfLines={1}>{patient.email || '—'}</Text>, // Email
        <Text style={styles.cellSecondary}>{patient.location || '—'}</Text>, // Location
        <Text style={styles.cellSecondary}>{patient.platform || '—'}</Text>, // Platform
        // Appointment Status
        <View style={styles.statusContainer}>
          {patient.appointment_status ? (
            <StatusBadge 
              status={patient.appointment_status} 
              label={patient.appointment_status ? patient.appointment_status.charAt(0).toUpperCase() + patient.appointment_status.slice(1) : '—'} 
            />
          ) : (
            <Text style={styles.statusText}>—</Text>
          )}
        </View>, // Status
        <Text style={styles.cellDate}>{formatDate(patient.created_at)}</Text>, // Joined Date
      );
      
      return {
        key: patientKey,
        data,
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
          // Dynamic column styling based on column name
          if (col === 'NAME') cellStyle = [styles.cell, styles.nameCell];
          else if (col === 'BUSINESS') cellStyle = [styles.cell, styles.businessCell];
          else if (col === 'AGE') cellStyle = [styles.cell, styles.ageCell];
          else if (col === 'GENDER') cellStyle = [styles.cell, styles.genderCell];
          else if (col === 'PHONE') cellStyle = [styles.cell, styles.phoneCell];
          else if (col === 'EMAIL') cellStyle = [styles.cell, styles.emailCell];
          else if (col === 'LOCATION') cellStyle = [styles.cell, styles.locationCell];
          else if (col === 'PLATFORM') cellStyle = [styles.cell, styles.platformCell];
          else if (col === 'STATUS') cellStyle = [styles.cell, styles.statusCell];
          else if (col === 'JOINED') cellStyle = [styles.cell, styles.joinedCell];
          
          return (
            <View key={col} style={cellStyle}>
              <Text style={styles.headerText}>{col}</Text>
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
              const colName = PATIENT_TABLE_COLUMNS[colIndex];
              let cellStyle = styles.cell;
              // Match cell styling to column name
              if (colName === 'NAME') cellStyle = [styles.cell, styles.nameCell];
              else if (colName === 'BUSINESS') cellStyle = [styles.cell, styles.businessCell];
              else if (colName === 'AGE') cellStyle = [styles.cell, styles.ageCell];
              else if (colName === 'GENDER') cellStyle = [styles.cell, styles.genderCell];
              else if (colName === 'PHONE') cellStyle = [styles.cell, styles.phoneCell];
              else if (colName === 'EMAIL') cellStyle = [styles.cell, styles.emailCell];
              else if (colName === 'LOCATION') cellStyle = [styles.cell, styles.locationCell];
              else if (colName === 'PLATFORM') cellStyle = [styles.cell, styles.platformCell];
              else if (colName === 'STATUS') cellStyle = [styles.cell, styles.statusCell];
              else if (colName === 'JOINED') cellStyle = [styles.cell, styles.joinedCell];
              
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
  nameCell: {
    flex: 1.5, // Name gets more space
  },
  businessCell: {
    flex: 1.3, // Business name gets more space
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
  statusCell: {
    flex: 1, // Status gets standard space
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
  statusContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
};

export default PatientSection;
