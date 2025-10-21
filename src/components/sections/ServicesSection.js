import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const SERVICES_TABLE_COLUMNS = ['SERVICE NAME', 'DESCRIPTION', 'CATEGORY', 'PRICE', 'DURATION', 'ACTIONS'];

const ServicesSection = ({ services = [], onRowPress, onEdit, onDelete }) => {
  console.log('ServicesSection received services:', services?.length || 0);

  const renderTableData = () => {
    return services.map((service, index) => {
      const serviceKey = `${service.service_id || service.service_name}-${index}`;
      
      return {
        key: serviceKey,
        data: [
          <Text style={styles.cellPrimary}>{service.service_name}</Text>, // Service Name
          <Text style={styles.cellDescription} numberOfLines={2}>{service.service_description || '—'}</Text>, // Description
          <Text style={styles.cellSecondary}>{service.service_category}</Text>, // Category
          <Text style={styles.cellPrice}>{service.currency || '$'}{service.service_price}</Text>, // Price
          <Text style={styles.cellSecondary}>{service.duration_min ? `${service.duration_min} min` : '—'}</Text>, // Duration
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onEdit && onEdit(service)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onDelete && onDelete(service)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>, // Actions
        ],
        service
      };
    });
  };


  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {SERVICES_TABLE_COLUMNS.map((col, colIndex) => {
          let cellStyle = styles.cell;
          if (colIndex === 0) cellStyle = [styles.cell, styles.serviceNameCell]; // Service Name
          else if (colIndex === 1) cellStyle = [styles.cell, styles.descriptionCell]; // Description
          else if (colIndex === 2) cellStyle = [styles.cell, styles.categoryCell]; // Category
          else if (colIndex === 3) cellStyle = [styles.cell, styles.priceCell]; // Price
          else if (colIndex === 4) cellStyle = [styles.cell, styles.durationCell]; // Duration
          else if (colIndex === 5) cellStyle = [styles.cell, styles.actionsCell]; // Actions
          
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
            onPress={() => onRowPress && onRowPress(rowData.service)}
            activeOpacity={0.7}
          >
            {rowData.data.map((cell, colIndex) => {
              let cellStyle = styles.cell;
              if (colIndex === 0) cellStyle = [styles.cell, styles.serviceNameCell]; // Service Name
              else if (colIndex === 1) cellStyle = [styles.cell, styles.descriptionCell]; // Description
              else if (colIndex === 2) cellStyle = [styles.cell, styles.categoryCell]; // Category
              else if (colIndex === 3) cellStyle = [styles.cell, styles.priceCell]; // Price
              else if (colIndex === 4) cellStyle = [styles.cell, styles.durationCell]; // Duration
              else if (colIndex === 5) cellStyle = [styles.cell, styles.actionsCell]; // Actions
              
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
    height: 400, // Fixed height for the table
    width: '100%', // Full width
    flex: 1, // Take available space
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
    flex: 1, // Take remaining space after header
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
  serviceNameCell: {
    flex: 1.5, // Service name gets more space
  },
  descriptionCell: {
    flex: 2.5, // Description gets the most space
  },
  categoryCell: {
    flex: 1, // Category gets standard space
  },
  priceCell: {
    flex: 1, // Price gets standard space
  },
  durationCell: {
    flex: 1, // Duration gets standard space
  },
  actionsCell: {
    flex: 0.8, // Actions gets less space (rightmost)
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
  cellPrice: {
    color: '#10B981', // Green for price
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
};

export default ServicesSection;