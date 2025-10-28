import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import NotificationSection from '../components/sections/NotificationSection';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch notifications
  const fetchNotifications = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    
    try {
      // Fetch notifications from notifications table
      const { data, error } = await supabase
        .from('notifications')
        .select('id, patient_id, appointment_id, message, created_at, is_read')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched notifications count:', data.length);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications(true);

    // Set up polling (every 10 seconds)
    const pollInterval = setInterval(() => {
      console.log('Polling for notifications...');
      fetchNotifications(false);
    }, 10000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Use all notifications without filtering
  const filteredNotifications = notifications;

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  const handleRowPress = async (notification) => {
    // Mark notification as read when clicked
    if (!notification.is_read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        if (error) throw error;
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // If notification has an appointment_id, fetch appointment details and navigate
    if (notification.appointment_id && navigation) {
      try {
        // Fetch appointment details from appointment_details view
        const { data, error } = await supabase
          .from('appointment_details')
          .select('*')
          .eq('appointment_id', notification.appointment_id)
          .single();

        if (error) throw error;

        // Navigate to AppointmentDetailsScreen with the appointment data
        navigation.navigate('AppointmentDetailsScreen', { appointment: data });
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        Alert.alert('Error', 'Failed to load appointment details');
      }
    } else if (!notification.appointment_id) {
      // If no appointment_id, just show an alert
      Alert.alert('Information', 'This notification is not linked to an appointment.');
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notification) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      if (error) throw error;

      showSnackbar('Notification marked as read', 'success');
      
      // Refresh the notifications list
      await fetchNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showSnackbar('Failed to mark notification as read', 'error');
    }
  };

  // Handle delete
  const handleDelete = (notification) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notification.id);

              if (error) throw error;

              showSnackbar('Notification deleted', 'success');
              
              // Refresh the notifications list
              await fetchNotifications(false);
            } catch (error) {
              console.error('Error deleting notification:', error);
              showSnackbar('Failed to delete notification', 'error');
            }
          }
        }
      ]
    );
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;

      showSnackbar('All notifications marked as read', 'success');
      
      // Refresh the notifications list
      await fetchNotifications(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showSnackbar('Failed to mark all notifications as read', 'error');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Notifications</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Notification</Text>
      <Text style={styles.subheader}>View and Manage System Notifications</Text>

      {/* Mark All as Read Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.markAllButton, 
            hasUnreadNotifications ? styles.markAllButtonActive : styles.markAllButtonDisabled
          ]} 
          onPress={handleMarkAllAsRead}
          disabled={!hasUnreadNotifications}
          activeOpacity={hasUnreadNotifications ? 0.7 : 1}
        >
          <Ionicons 
            name="checkmark-done" 
            size={20} 
            color={hasUnreadNotifications ? 'white' : Colors.textSecondary} 
          />
          <Text style={[
            styles.markAllButtonText,
            hasUnreadNotifications ? styles.markAllButtonTextActive : styles.markAllButtonTextDisabled
          ]}>
            Mark All as Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <NotificationSection 
          notifications={filteredNotifications} 
          onRowPress={handleRowPress}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      </View>

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
            <Ionicons 
              name={snackbarType === 'success' ? 'checkmark-circle' : 'close-circle'} 
              size={20} 
              color="white" 
            />
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
            <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarClose}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  breadcrumbText: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  breadcrumbSeparator: {
    color: Colors.textSecondary,
    marginHorizontal: 8,
    fontSize: 16,
  },
  breadcrumbActive: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 34,
  },
  subheader: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginBottom: Layout.spacing.lg,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  markAllButtonActive: {
    backgroundColor: '#0277BD', // Bright blue when active
  },
  markAllButtonDisabled: {
    backgroundColor: '#1e2c35', // Dark color when disabled
    opacity: 0.5,
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  markAllButtonTextActive: {
    color: 'white',
  },
  markAllButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  tableWrapper: {
    flex: 1,
    width: '100%',
  },
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
});

export default NotificationScreen;
