import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Modal, TextInput, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import StatusBadge from '../components/StatusBadge';
import { chatService } from '../services/chatService';
import { supabase } from '../config/supabase';

const AppointmentDetailsScreen = ({ appointment, chatHistory = [], navigation }) => {
  
  // State for chat functionality
  const [chatMessages, setChatMessages] = useState(chatHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAgentActive, setIsAIAgentActive] = useState(appointment?.isbotactive !== false);
  const [isUpdatingBotStatus, setIsUpdatingBotStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBotStatus, setPendingBotStatus] = useState(null);
  const scrollViewRef = useRef(null);

  // State for edit appointment modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    scheduled_date: '',
    scheduled_time: '',
    service_name: '',
    service_category: '',
    service_price: '',
    status: ''
  });
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);
  const [dayDropdownVisible, setDayDropdownVisible] = useState(false);
  const [yearDropdownVisible, setYearDropdownVisible] = useState(false);
  const [timeDropdownVisible, setTimeDropdownVisible] = useState(false);
  
  // Status update modal state
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [pendingStatusValue, setPendingStatusValue] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const snackbarAnimation = new Animated.Value(0);

  const refreshChatHistory = useCallback(async () => {
    if (!appointment?.sender_id) return;
    
    try {
      setIsLoading(true);
      const messages = await chatService.getChatHistory(appointment.sender_id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error refreshing chat history:', error);
      Alert.alert('Error', 'Failed to refresh chat history');
    } finally {
      setIsLoading(false);
    }
  }, [appointment?.sender_id]);

  // Fetch chat history on mount
  useEffect(() => {
    if (appointment?.sender_id && chatHistory.length === 0) {
      refreshChatHistory();
    }
  }, [appointment?.sender_id, chatHistory.length, refreshChatHistory]);

  const handleBotStatusToggle = (newValue) => {
    if (!appointment?.sender_id) {
      Alert.alert('Error', 'No patient sender ID available');
      return;
    }

    // Show confirmation modal for both enable and disable actions
    setPendingBotStatus(newValue);
    setShowConfirmModal(true);
  };

  const updateBotStatus = async (newValue) => {
    try {
      setIsUpdatingBotStatus(true);
      await chatService.updatePatientBotStatus(appointment.sender_id, newValue);
      setIsAIAgentActive(newValue);
      
      // Show success message
      Alert.alert(
        'Success', 
        `AI Agent ${newValue ? 'activated' : 'deactivated'} successfully`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating bot status:', error);
      Alert.alert('Error', 'Failed to update AI Agent status');
    } finally {
      setIsUpdatingBotStatus(false);
    }
  };

  const handleConfirmDisable = () => {
    setShowConfirmModal(false);
    if (pendingBotStatus !== null) {
      updateBotStatus(pendingBotStatus);
      setPendingBotStatus(null);
    }
  };

  const handleCancelDisable = () => {
    setShowConfirmModal(false);
    setPendingBotStatus(null);
  };

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

  // Header action: open status confirm
  const handleHeaderStatusPress = (newStatus) => {
    if (!appointment?.appointment_id) {
      Alert.alert('Error', 'Missing appointment ID');
      return;
    }
    setPendingStatusValue(newStatus);
    setShowStatusConfirmModal(true);
  };

  // Confirm status update
  const handleConfirmStatusUpdate = async () => {
    if (!appointment?.appointment_id || !pendingStatusValue) return;

    try {
      setIsUpdatingStatus(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status: pendingStatusValue })
        .eq('id', appointment.appointment_id);
      if (error) throw error;

      showSnackbar(
        `Appointment marked as ${pendingStatusValue.charAt(0).toUpperCase() + pendingStatusValue.slice(1)}`,
        'success'
      );
      setShowStatusConfirmModal(false);
      setPendingStatusValue(null);

      if (navigation) {
        navigation.navigate('Appointment');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showSnackbar('Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelStatusUpdate = () => {
    setShowStatusConfirmModal(false);
    setPendingStatusValue(null);
  };

  // Handle edit appointment
  const handleEditAppointment = () => {
    if (!appointment) return;
    
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
    if (!appointment) return;

    try {
      setIsUpdatingAppointment(true);
      
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
        .eq('id', appointment.appointment_id);

      if (error) throw error;

      showSnackbar('Appointment updated successfully', 'success');
      setEditModalVisible(false);
      
      // Refresh the page by navigating back and re-entering
      if (navigation) {
        navigation.navigate('Appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      showSnackbar('Failed to update appointment', 'error');
    } finally {
      setIsUpdatingAppointment(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };


  const renderChatMessage = (message) => {
    const isBot = message.role === 'bot';
    
    return (
      <View key={message.id} style={[
        isBot ? styles.chatBubbleRight : styles.chatBubbleLeft
      ]}>
        <Text style={styles.chatText}>{message.text}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.chatTimestamp}>{formatTimestamp(message.created_at)}</Text>
        </View>
      </View>
    );
  };

  // Sort messages with newest at the bottom
  const sortedMessages = [...chatMessages].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );
  
  return (
    <ScrollView style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => navigation?.navigate('Appointment')}>
          <Text style={styles.breadcrumbText}>Appointments</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Appointment Details</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Appointment Details</Text>
      <Text style={styles.subheader}>View and manage details for this appointment</Text>

      {/* Two-column layout */}
      <View style={styles.rowContainer}>
        {/* Left Column: Patient Details */}
        <View style={styles.leftCard}>
          {/* Patient Header */}
          <View style={styles.patientHeader}>
            {appointment?.profilepicture ? (
              <Image 
                source={{ uri: appointment.profilepicture }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={30} color={Colors.textSecondary} />
              </View>
            )}
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{appointment?.name || 'Unknown Patient'}</Text>
              <Text style={styles.patientId}>Patient ID: {appointment?.patient_id?.slice(0, 6) || '—'}</Text>
            </View>
            <View style={styles.headerActionButtons}>
              <TouchableOpacity 
                style={[styles.headerActionButton, styles.doneBtn]}
                onPress={() => handleHeaderStatusPress('completed')}
              >
                <MaterialIcons name="check-circle-outline" size={16} color="white" />
                <Text style={styles.headerActionText}>Mark as Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerActionButton, styles.cancelBtn]}
                onPress={() => handleHeaderStatusPress('cancelled')}
              >
                <MaterialIcons name="cancel" size={16} color="white" />
                <Text style={styles.headerActionText}>Mark as Cancelled</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Sections Side by Side */}
          <View style={styles.detailsRow}>
            {/* Patient Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <DetailRow label="Patient Name" value={appointment?.name || '—'} />
              <DetailRow label="Age" value={appointment?.age ? `${appointment.age} years old` : '—'} />
              <DetailRow label="Gender" value={appointment?.gender || '—'} />
              <DetailRow label="Phone" value={appointment?.phone || '—'} />
              <DetailRow label="Email" value={appointment?.email || '—'} />
              <DetailRow label="Location" value={appointment?.location || '—'} />
            </View>

            {/* Appointment Info */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Appointment Details</Text>
              <DetailRow label="Appointment ID" value={appointment?.appointment_id || '—'} />
              <DetailRow label="Date & Time" value={`${appointment?.scheduled_date || '—'} ${appointment?.scheduled_time || ''}`} />
              <DetailRow label="Service" value={appointment?.service_name || '—'} />
              <DetailRow label="Service Category" value={appointment?.service_category || '—'} />
              <DetailRow label="Service Price" value={appointment?.service_price ? `$${appointment.service_price}` : '—'} />
              <DetailRow label="Status" value={<StatusBadge status={appointment?.status} label={appointment?.status} />} />
              <DetailRow label="Created At" value={appointment?.appointment_created_at ? new Date(appointment.appointment_created_at).toLocaleString() : '—'} />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#0288D1' }]}>
                <Text style={styles.quickBtnText}>Send Reminder</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickBtn, { backgroundColor: '#01579B' }]}
                onPress={handleEditAppointment}
              >
                <Text style={styles.quickBtnText}>Edit Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Column: Conversation */}
        <View style={styles.rightCard}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>Conversation with Messaging</Text>
            
            {/* AI Agent Section */}
            <View style={styles.aiAgentSection}>
              <View style={styles.aiAgentHeader}>
                <View style={styles.aiAgentTitleRow}>
                  <MaterialIcons name="smart-toy" size={20} color="#0277BD" />
                  <Text style={styles.aiAgentLabel}>AI Agent Chatbot</Text>
                </View>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={refreshChatHistory}
                  disabled={isLoading}
                >
                  <MaterialIcons 
                    name="refresh" 
                    size={16} 
                    color={isLoading ? Colors.textSecondary : Colors.text} 
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    styles.toggleButtonLeft,
                    isAIAgentActive && styles.toggleButtonActive
                  ]}
                  onPress={() => handleBotStatusToggle(true)}
                  disabled={isUpdatingBotStatus}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    isAIAgentActive && styles.toggleButtonTextActive
                  ]}>
                    Enable AI
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    styles.toggleButtonRight,
                    !isAIAgentActive && styles.toggleButtonActive
                  ]}
                  onPress={() => handleBotStatusToggle(false)}
                  disabled={isUpdatingBotStatus}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    !isAIAgentActive && styles.toggleButtonTextActive
                  ]}>
                    Disable AI
                  </Text>
                </TouchableOpacity>
              </View>
              {isUpdatingBotStatus && (
                <ActivityIndicator size="small" color={Colors.textSecondary} style={styles.toggleLoading} />
              )}
            </View>
          </View>

          <View style={styles.conversationContent}>
            {/* Chat Section */}
            <View style={styles.chatSection}>
              <ScrollView 
                ref={scrollViewRef}
                style={styles.chatScrollView} 
                contentContainerStyle={styles.chatContainer}
                showsVerticalScrollIndicator={false}
              >
                {isLoading && chatMessages.length === 0 ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading chat history...</Text>
                  </View>
                ) : sortedMessages.length === 0 ? (
                  <View style={styles.emptyChatContainer}>
                    <Text style={styles.emptyChatText}>No messages yet. Start a conversation!</Text>
                  </View>
                ) : (
                  sortedMessages.map(renderChatMessage)
                )}
              </ScrollView>
            </View>

          </View>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDisable}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Are you sure?</Text>
              <Text style={styles.modalMessage}>
                {pendingBotStatus 
                  ? "Enabling the AI Agent will start automated replies for this appointment."
                  : "Disabling the AI Agent will stop automated replies for this appointment."
                }
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancelDisable}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmDisable}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  {pendingBotStatus ? "Enable AI" : "Disable AI"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal
        visible={showStatusConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelStatusUpdate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Action</Text>
              <Text style={styles.modalMessage}>
                {pendingStatusValue === 'completed' && 'Mark this appointment as Completed?'}
                {pendingStatusValue === 'cancelled' && 'Mark this appointment as Cancelled?'}
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancelStatusUpdate}
                disabled={isUpdatingStatus}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmStatusUpdate}
                disabled={isUpdatingStatus}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  {isUpdatingStatus
                    ? 'Updating...'
                    : pendingStatusValue === 'completed'
                      ? 'Mark Completed'
                      : 'Mark Cancelled'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Appointment</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.editCloseButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
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
                <Text style={styles.formLabel}>Time</Text>
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
                <Text style={styles.formLabel}>Service Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.service_name}
                  onChangeText={(text) => setEditForm({...editForm, service_name: text})}
                  placeholder="Service name"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Category</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.service_category}
                  onChangeText={(text) => setEditForm({...editForm, service_category: text})}
                  placeholder="Service category"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Price</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.service_price}
                  onChangeText={(text) => setEditForm({...editForm, service_price: text})}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
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
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEditForm({...editForm, status: 'completed'});
                        setStatusDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Completed</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.editModalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateAppointment}
                disabled={isUpdatingAppointment}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdatingAppointment ? 'Saving...' : 'Save Changes'}
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
    </ScrollView>
  );
};

// Subcomponent for detail rows
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    {typeof value === 'string' ? (
      <Text style={styles.detailValue}>{value}</Text>
    ) : (
      value
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  breadcrumbText: { color: Colors.textSecondary, fontSize: 16 },
  breadcrumbSeparator: { color: Colors.textSecondary, marginHorizontal: 8, fontSize: 16 },
  breadcrumbActive: { color: Colors.text, fontWeight: '600', fontSize: 16 },
  header: { fontSize: 30, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  subheader: { fontSize: 17, color: Colors.textSecondary, marginBottom: Layout.spacing.xl },
  rowContainer: { flexDirection: 'row', gap: 24 },
  leftCard: {
    flex: 2,
    backgroundColor: '#0F1A20',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rightCard: {
    flex: 1.5,
    backgroundColor: '#0F1A20',
    borderRadius: 14,
    padding: 0,
    justifyContent: 'space-between',
  },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, justifyContent: 'space-between' },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1d293b', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  patientInfo: { flex: 1 },
  patientName: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  patientId: { color: Colors.textSecondary, fontSize: 14 },
  headerActionButtons: { flexDirection: 'row', gap: 6 },
  headerActionButton: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    gap: 4,
  },
  doneBtn: { backgroundColor: '#1B5E20' },
  cancelBtn: { backgroundColor: '#B71C1C' },
  headerActionText: { color: 'white', fontWeight: '600', fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: '#1e2c35',
    marginVertical: 16,
  },
  detailsRow: { flexDirection: 'row', gap: 24 },
  detailsSection: { flex: 1, marginBottom: 22 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  detailRow: { marginBottom: 12 },
  detailLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  detailValue: { color: Colors.text, fontSize: 16, lineHeight: 24 },
  quickActions: { borderTopWidth: 1, borderTopColor: '#1e2c35', paddingTop: 16 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  quickBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  chatHeader: {
    padding: 24,
    flexShrink: 0,
  },
  chatHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  conversationContent: { 
    flexDirection: 'column',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#1e2c35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAgentSection: { 
    flexDirection: 'column', 
    gap: 12,
    marginBottom: 16,
  },
  aiAgentHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aiAgentTitleRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  aiAgentLabel: { 
    color: Colors.textSecondary, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  toggleButtonsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#1e2c35', 
    borderRadius: 8, 
    padding: 4,
    gap: 0
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  toggleButtonRight: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#0F1A20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.text,
  },
  toggleLoading: { marginTop: 8, alignSelf: 'center' },
  chatSection: {
    height: 500,
    paddingHorizontal: 24,
  },
  chatScrollView: {
    flex: 1,
  },
  chatContainer: { 
    paddingVertical: 16,
    gap: 16, 
    justifyContent: 'flex-start',
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#162630',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#0277BD',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  chatText: { color: 'white', fontSize: 14, lineHeight: 20 },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  chatTimestamp: { color: Colors.textSecondary, fontSize: 12 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyChatText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#0F1A20',
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#1e2c35',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e2c35',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonConfirm: {
    borderLeftWidth: 1,
    borderLeftColor: '#1e2c35',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  modalButtonTextConfirm: {
    color: '#ef4444',
  },
  // Edit Modal styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
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
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2c35',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  editCloseButton: {
    padding: 4,
  },
  editModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  editModalFooter: {
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
    backgroundColor: '#0277BD',
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
});

export default AppointmentDetailsScreen;
