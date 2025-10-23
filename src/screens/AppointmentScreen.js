import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import AppointmentsSection from '../components/sections/AppointmentsSection';
import { chatService } from '../services/chatService';

const AppointmentScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [dateRangeMenuVisible, setDateRangeMenuVisible] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      
      try {
        // Use the same pattern as HomeViewModel.js - fetch from appointment_details view
        const selectColumns = 
          'appointment_id, patient_id, sender_id, name, email, phone, gender, age, profilepicture, service_name, service_category, service_price, status, scheduled_date, scheduled_time, appointment_created_at';

        const { data, error } = await supabase
          .from('appointment_details')
          .select(selectColumns)
          .order('scheduled_date', { ascending: false })
          .order('scheduled_time', { ascending: false });

        if (error) throw error;
        
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleRowPress = async (appointment) => {
    if (navigation) {
      try {
        // Fetch chat history for this appointment
        const chatHistory = await chatService.getChatHistory(appointment.sender_id);
        
        // Pass both appointment and chat history to details screen
        navigation.navigate('AppointmentDetailsScreen', { 
          appointment,
          chatHistory 
        });
      } catch (error) {
        console.error('Error fetching chat history:', error);
        // Still navigate even if chat history fails
        navigation.navigate('AppointmentDetailsScreen', { 
          appointment,
          chatHistory: [] 
        });
      }
    } else {
      // Fallback for when navigation is not available
      console.log('Navigation not available, appointment data:', appointment);
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
        <Text style={styles.breadcrumbActive}>Appointments</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Appointment Details</Text>
      <Text style={styles.subheader}>View and Manage Appointment Details</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters Row */}
      <View style={styles.filtersContainer}>
        {/* Status Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Status</Text>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setStatusMenuVisible(true)}
                style={styles.filterButton}
                labelStyle={styles.filterButtonText}
                icon="chevron-down"
              >
                {statusFilter === 'all' ? 'Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setStatusFilter('all'); setStatusMenuVisible(false); }} title="All Status" />
            <Menu.Item onPress={() => { setStatusFilter('confirmed'); setStatusMenuVisible(false); }} title="Confirmed" />
            <Menu.Item onPress={() => { setStatusFilter('pending'); setStatusMenuVisible(false); }} title="Pending" />
            <Menu.Item onPress={() => { setStatusFilter('cancelled'); setStatusMenuVisible(false); }} title="Cancelled" />
          </Menu>
        </View>

        {/* Date Range Filter */}
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Date Range</Text>
          <Menu
            visible={dateRangeMenuVisible}
            onDismiss={() => setDateRangeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setDateRangeMenuVisible(true)}
                style={styles.filterButton}
                labelStyle={styles.filterButtonText}
                icon="chevron-down"
              >
                {dateRangeFilter === 'all' ? 'Date Range' : 
                 dateRangeFilter === 'today' ? 'Today' :
                 dateRangeFilter === 'this_week' ? 'This Week' :
                 dateRangeFilter === 'this_month' ? 'This Month' : 'All Dates'}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setDateRangeFilter('all'); setDateRangeMenuVisible(false); }} title="All Dates" />
            <Menu.Item onPress={() => { setDateRangeFilter('today'); setDateRangeMenuVisible(false); }} title="Today" />
            <Menu.Item onPress={() => { setDateRangeFilter('this_week'); setDateRangeMenuVisible(false); }} title="This Week" />
            <Menu.Item onPress={() => { setDateRangeFilter('this_month'); setDateRangeMenuVisible(false); }} title="This Month" />
          </Menu>
        </View>
      </View>

      {/* Table */}
      <AppointmentsSection 
        appointments={appointments} 
        onRowPress={handleRowPress}
      />
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
    marginBottom: Layout.spacing.md,
    lineHeight: 24,
  },
  searchContainer: {
    marginBottom: Layout.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Layout.spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: Layout.spacing.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  filterItem: {
    flex: 0.1,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  filterButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
});

export default AppointmentScreen;
