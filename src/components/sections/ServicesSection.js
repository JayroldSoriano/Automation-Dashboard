import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../config/supabase';

const SERVICES_TABLE_COLUMNS = ['SERVICE NAME', 'DESCRIPTION', 'CATEGORY', 'PRICE', 'DURATION', 'ACTIONS'];

const ServicesSection = ({ services = [], onRowPress, onServiceUpdate }) => {
  console.log('ServicesSection received services:', services?.length || 0);

  // State for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    service_name: '',
    service_description: '',
    service_category: '',
    service_price: '',
    duration_min: '',
    active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const snackbarAnimation = new Animated.Value(0);

  // Snackbar functions
  const showSnackbar = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
    
    Animated.timing(snackbarAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideSnackbar();
    }, 3000);
  };

  const hideSnackbar = () => {
    Animated.timing(snackbarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSnackbarVisible(false);
    });
  };

  // Handle edit service
  const handleEditService = (service) => {
    setEditingService(service);
    setEditForm({
      service_name: service.service_name || '',
      service_description: service.service_description || '',
      service_category: service.service_category || '',
      service_price: service.service_price?.toString() || '',
      duration_min: service.duration_min?.toString() || '',
      active: service.active !== false
    });
    setEditModalVisible(true);
  };

  // Handle update service
  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      setIsLoading(true);
      
      const updateData = {
        service_name: editForm.service_name,
        service_description: editForm.service_description,
        service_category: editForm.service_category,
        service_price: parseFloat(editForm.service_price) || 0,
        duration_min: parseInt(editForm.duration_min) || 0,
        active: editForm.active
      };

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('service_id', editingService.service_id);

      if (error) throw error;

      showSnackbar('Service updated successfully', 'success');
      setEditModalVisible(false);
      
      if (onServiceUpdate) {
        onServiceUpdate();
      }
    } catch (error) {
      console.error('Error updating service:', error);
      showSnackbar('Failed to update service', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              onPress={() => handleEditService(service)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
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

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Service</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Service Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.service_name}
                  onChangeText={(text) => setEditForm({...editForm, service_name: text})}
                  placeholder="Service name"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.service_description}
                  onChangeText={(text) => setEditForm({...editForm, service_description: text})}
                  placeholder="Service description"
                  placeholderTextColor={Colors.textSecondary}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setCategoryDropdownVisible(!categoryDropdownVisible)}
                >
                  <Text style={styles.dropdownText}>{editForm.service_category || 'Select Category'}</Text>
                  <MaterialIcons 
                    name={categoryDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {categoryDropdownVisible && (
                  <View style={styles.dropdownMenu}>
                    {['Medical', 'Dental', 'Cosmetic', 'Wellness', 'Emergency', 'Consultation'].map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setEditForm({...editForm, service_category: category});
                          setCategoryDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.service_price}
                  onChangeText={(text) => setEditForm({...editForm, service_price: text})}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.duration_min}
                  onChangeText={(text) => setEditForm({...editForm, duration_min: text})}
                  placeholder="30"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateService}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Snackbar */}
      {snackbarVisible && (
        <Animated.View 
          style={[
            styles.snackbar,
            {
              backgroundColor: snackbarType === 'success' ? '#1B5E20' : '#B71C1C',
              transform: [{
                translateY: snackbarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.snackbarContent}>
            <MaterialIcons 
              name={snackbarType === 'success' ? 'check-circle' : 'error'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
            <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarClose}>
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0F1A20',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2c35',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e2c35',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2b3a4c',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary || '#0277BD',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Dropdown styles
  dropdownButton: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  dropdownMenu: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2b3a4c',
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  // Snackbar styles
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  snackbarText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  snackbarClose: {
    padding: 4,
  },
};

export default ServicesSection;