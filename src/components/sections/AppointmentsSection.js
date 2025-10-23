import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StatusBadge from '../StatusBadge';
import { processAppointmentsForTable } from '../../utils/dataUtils';
import { HOME_SCREEN_CONSTANTS } from '../../constants/HomeScreen';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../config/supabase';

const AppointmentsSection = ({ appointments = [], onRowPress, onAppointmentUpdate }) => {
  console.log('AppointmentsSection received appointments:', appointments?.length || 0);
  // Remove limit to show all appointments
  const tableData = processAppointmentsForTable(appointments, appointments.length);
  console.log('Processed table data:', tableData?.length || 0);

  // State for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({
    scheduled_date: '',
    scheduled_time: '',
    service_name: '',
    service_category: '',
    service_price: '',
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);
  const [dayDropdownVisible, setDayDropdownVisible] = useState(false);
  const [yearDropdownVisible, setYearDropdownVisible] = useState(false);
  const [timeDropdownVisible, setTimeDropdownVisible] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success'); // 'success' or 'error'
  const snackbarAnimation = new Animated.Value(0);


  // Generate time options (every 30 minutes from 8 AM to 8 PM)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayString = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, label: displayString });
      }
    }
    return times;
  };

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

    // Auto hide after 3 seconds
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

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditForm({
      scheduled_date: appointment.scheduled_date || '',
      scheduled_time: appointment.scheduled_time || '',
      service_name: appointment.service_name || '',
      service_category: appointment.service_category || '',
      service_price: appointment.service_price?.toString() || '',
      status: appointment.status || ''
    });
    setEditModalVisible(true);
  };



  // Handle update appointment
  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      setIsLoading(true);
      
      const updateData = {
        scheduled_date: editForm.scheduled_date,
        scheduled_time: editForm.scheduled_time,
        service_name: editForm.service_name,
        service_category: editForm.service_category,
        service_price: parseFloat(editForm.service_price) || 0,
        status: editForm.status
      };

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', editingAppointment.appointment_id);

      if (error) throw error;

      showSnackbar('Appointment updated successfully', 'success');
      setEditModalVisible(false);
      
      // Refresh the appointments list
      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      showSnackbar('Failed to update appointment', 'error');
    } finally {
      setIsLoading(false);
    }
  };


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
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditAppointment(appointment)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="edit" size={16} color={Colors.primary} />
          </TouchableOpacity>
        ],
        appointment
      };
    });
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {[...HOME_SCREEN_CONSTANTS.TABLE_COLUMNS, 'Action'].map((col) => (
          <Text key={col} style={styles.headerText}>
            {col.toUpperCase()}
          </Text>
        ))}
      </View>

      {/* Table Body */}
      <ScrollView 
        style={styles.tableBody}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={false}
        scrollEnabled={true}
      >
        {renderTableData().map((rowData, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[
              styles.tableRow,
              rowIndex === renderTableData().length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            {rowData.data.map((cell, colIndex) => (
              <TouchableOpacity 
                key={`cell-${colIndex}`} 
                style={styles.cell}
                onPress={() => colIndex < 8 && onRowPress && onRowPress(rowData.appointment)}
                activeOpacity={colIndex < 8 ? 0.7 : 1}
                disabled={colIndex >= 8}
              >
                {cell}
              </TouchableOpacity>
            ))}
          </View>
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
              <Text style={styles.modalTitle}>Edit Appointment</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.dateRow}>
                  {/* Month Dropdown */}
                  <View style={styles.dateDropdownContainer}>
                    <TouchableOpacity
                      style={styles.dateDropdownButton}
                      onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
                    >
                      <Text style={styles.dropdownText}>
                        {editForm.scheduled_date ? 
                          new Date(editForm.scheduled_date).toLocaleDateString('en-US', { month: 'short' }) : 
                          'Month'
                        }
                      </Text>
                      <MaterialIcons 
                        name={monthDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={16} 
                        color={Colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {monthDropdownVisible && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={false}>
                          {[
                            { value: '01', label: 'Jan' },
                            { value: '02', label: 'Feb' },
                            { value: '03', label: 'Mar' },
                            { value: '04', label: 'Apr' },
                            { value: '05', label: 'May' },
                            { value: '06', label: 'Jun' },
                            { value: '07', label: 'Jul' },
                            { value: '08', label: 'Aug' },
                            { value: '09', label: 'Sep' },
                            { value: '10', label: 'Oct' },
                            { value: '11', label: 'Nov' },
                            { value: '12', label: 'Dec' }
                          ].map((month) => (
                            <TouchableOpacity
                              key={month.value}
                              style={styles.dropdownItem}
                              onPress={() => {
                                const currentDate = editForm.scheduled_date ? new Date(editForm.scheduled_date) : new Date();
                                const newDate = new Date(currentDate.getFullYear(), parseInt(month.value) - 1, currentDate.getDate());
                                setEditForm({...editForm, scheduled_date: newDate.toISOString().split('T')[0]});
                                setMonthDropdownVisible(false);
                              }}
                            >
                              <Text style={styles.dropdownItemText}>{month.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Day Dropdown */}
                  <View style={styles.dateDropdownContainer}>
                    <TouchableOpacity
                      style={styles.dateDropdownButton}
                      onPress={() => setDayDropdownVisible(!dayDropdownVisible)}
                    >
                      <Text style={styles.dropdownText}>
                        {editForm.scheduled_date ? 
                          new Date(editForm.scheduled_date).getDate().toString().padStart(2, '0') : 
                          'Day'
                        }
                      </Text>
                      <MaterialIcons 
                        name={dayDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={16} 
                        color={Colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {dayDropdownVisible && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={false}>
                          {Array.from({length: 31}, (_, i) => {
                            const day = (i + 1).toString().padStart(2, '0');
                            return (
                              <TouchableOpacity
                                key={day}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  const currentDate = editForm.scheduled_date ? new Date(editForm.scheduled_date) : new Date();
                                  const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day));
                                  setEditForm({...editForm, scheduled_date: newDate.toISOString().split('T')[0]});
                                  setDayDropdownVisible(false);
                                }}
                              >
                                <Text style={styles.dropdownItemText}>{day}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Year Dropdown */}
                  <View style={styles.dateDropdownContainer}>
                    <TouchableOpacity
                      style={styles.dateDropdownButton}
                      onPress={() => setYearDropdownVisible(!yearDropdownVisible)}
                    >
                      <Text style={styles.dropdownText}>
                        {editForm.scheduled_date ? 
                          new Date(editForm.scheduled_date).getFullYear().toString() : 
                          'Year'
                        }
                      </Text>
                      <MaterialIcons 
                        name={yearDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={16} 
                        color={Colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {yearDropdownVisible && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={false}>
                          {Array.from({length: 6}, (_, i) => {
                            const year = (new Date().getFullYear() + i).toString();
                            return (
                              <TouchableOpacity
                                key={year}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  const currentDate = editForm.scheduled_date ? new Date(editForm.scheduled_date) : new Date();
                                  const newDate = new Date(parseInt(year), currentDate.getMonth(), currentDate.getDate());
                                  setEditForm({...editForm, scheduled_date: newDate.toISOString().split('T')[0]});
                                  setYearDropdownVisible(false);
                                }}
                              >
                                <Text style={styles.dropdownItemText}>{year}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setTimeDropdownVisible(!timeDropdownVisible)}
                >
                  <Text style={styles.dropdownText}>
                    {editForm.scheduled_time ? 
                      new Date(`2000-01-01T${editForm.scheduled_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : 
                      'Select Time'
                    }
                  </Text>
                  <MaterialIcons 
                    name={timeDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {timeDropdownVisible && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={false}>
                      {generateTimeOptions().map((timeOption) => (
                        <TouchableOpacity
                          key={timeOption.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setEditForm({...editForm, scheduled_time: timeOption.value});
                            setTimeDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{timeOption.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

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
                <Text style={styles.label}>Service Category</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.service_category}
                  onChangeText={(text) => setEditForm({...editForm, service_category: text})}
                  placeholder="Service category"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Service Price</Text>
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
                <Text style={styles.label}>Status</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setStatusDropdownVisible(!statusDropdownVisible)}
                >
                  <Text style={styles.dropdownText}>{editForm.status || 'Select Status'}</Text>
                  <MaterialIcons 
                    name={statusDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {statusDropdownVisible && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEditForm({...editForm, status: 'pending'});
                        setStatusDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEditForm({...editForm, status: 'confirmed'});
                        setStatusDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Confirmed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEditForm({...editForm, status: 'cancelled'});
                        setStatusDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Cancelled</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
                onPress={handleUpdateAppointment}
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
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#1e2c35',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
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
    width: '40%',
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
  dropdownScrollView: {
    maxHeight: 200,
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
  // Date dropdown styles
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateDropdownContainer: {
    flex: 1,
  },
  dateDropdownButton: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
};

export default AppointmentsSection;
