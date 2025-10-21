import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StatusBadge from '../StatusBadge';
import { processAppointmentsForTable } from '../../utils/dataUtils';
import { HOME_SCREEN_CONSTANTS } from '../../constants/HomeScreen';
import { Colors } from '../../constants/Colors';

const AppointmentsSection = ({ appointments = [], onRowPress }) => {
  console.log('AppointmentsSection received appointments:', appointments?.length || 0);
  // Remove limit to show all appointments
  const tableData = processAppointmentsForTable(appointments, appointments.length);
  console.log('Processed table data:', tableData?.length || 0);

  const renderTableData = () => {
    return tableData.map(({ key, data }, index) => {
      const appointment = appointments[index];
      return {
        key,
        data: [
          <Text style={styles.cellSecondary}>{data[0]}</Text>, // Date
          <Text style={styles.cellSecondary}>{data[1]}</Text>, // Time
          data[2] ? ( // Profile Picture
            <Image 
              source={{ uri: data[2] }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <MaterialIcons name="person" size={20} color={Colors.textSecondary} />
            </View>
          ),
          <Text style={styles.cellPrimary}>{data[3]}</Text>, // Patient Name
          <Text style={styles.cellSecondary}>{data[4]}</Text>, // Email
          <Text style={styles.cellSecondary}>{data[5]}</Text>, // Phone
          <Text style={styles.cellSecondary}>{data[6]}</Text>, // Service
          <StatusBadge key={`status-${key}`} status={data[7].status} label={data[7].label} />, // Status
        ],
        appointment
      };
    });
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {HOME_SCREEN_CONSTANTS.TABLE_COLUMNS.map((col) => (
          <Text key={col} style={styles.headerText}>
            {col.toUpperCase()}
          </Text>
        ))}
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
            onPress={() => onRowPress && onRowPress(rowData.appointment)}
            activeOpacity={0.7}
          >
            {rowData.data.map((cell, colIndex) => (
              <View key={`cell-${colIndex}`} style={styles.cell}>
                {cell}
              </View>
            ))}
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
    height: 400, // Fixed height for the table
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#172131', // header bg
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    flex: 1, // Take remaining space after header
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2b3a4c', // subtle separator line
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cell: {
    flex: 1,
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
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1d293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default AppointmentsSection;
