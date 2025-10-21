import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import NotificationSection from '../components/sections/NotificationSection';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      
      try {
        // Fetch notifications from notifications table
        const { data, error } = await supabase
          .from('notifications')
          .select('notification_id, title, message, notification_type, status, priority, created_at, updated_at, read_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log('Fetched notifications count:', data.length);
        console.log('Sample notification data:', data[0]);
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Use all notifications without filtering
  const filteredNotifications = notifications;

  const handleRowPress = (notification) => {
    if (navigation) {
      navigation.navigate('NotificationDetailsScreen', { notification });
    } else {
      // Fallback for when navigation is not available
      console.log('Navigation not available, notification data:', notification);
    }
  };

  const handleMarkAsRead = (notification) => {
    console.log('Mark as read notification:', notification);
    // TODO: Implement mark as read functionality
  };

  const handleDelete = (notification) => {
    console.log('Delete notification:', notification);
    // TODO: Implement delete functionality
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all notifications as read');
    // TODO: Implement mark all as read functionality
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
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Ionicons name="checkmark-done" size={20} color={Colors.background} />
          <Text style={styles.markAllButtonText}>Mark All as Read</Text>
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
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  markAllButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  tableWrapper: {
    flex: 1,
    width: '100%',
  },
});

export default NotificationScreen;
