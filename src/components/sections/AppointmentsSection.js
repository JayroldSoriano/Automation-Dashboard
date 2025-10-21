import React from 'react';
import { View, Text } from 'react-native';
import StatusBadge from '../StatusBadge';
import { processAppointmentsForTable } from '../../utils/dataUtils';
import { HOME_SCREEN_CONSTANTS } from '../../constants/HomeScreen';
import { Colors } from '../../constants/Colors';

const AppointmentsSection = ({ appointments = [] }) => {
  const tableData = processAppointmentsForTable(appointments);

  const renderTableData = () => {
    return tableData.map(({ key, data }) => [
      <Text style={styles.cellSecondary}>{data[0]}</Text>, // Date
      <Text style={styles.cellSecondary}>{data[1]}</Text>, // Time
      <Text style={styles.cellPrimary}>{data[2]}</Text>, // Name
      <Text style={styles.cellSecondary}>{data[3]}</Text>, // Email or Service
      <StatusBadge key={`status-${key}`} status={data[4].status} label={data[4].label} />,
    ]);
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
      <View style={styles.tableBody}>
        {renderTableData().map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[
              styles.tableRow,
              rowIndex === renderTableData().length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            {row.map((cell, colIndex) => (
              <View key={`cell-${colIndex}`} style={styles.cell}>
                {cell}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = {
  tableContainer: {
    backgroundColor: '#121e23', // table bg
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
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
};

export default AppointmentsSection;
