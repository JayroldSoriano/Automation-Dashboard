import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import PatientSection from '../components/sections/PatientSection';
import ChatbotConversationSection from '../components/sections/ChatbotConversationSection';
import DemographicsSection from '../components/sections/DemographicsSection';
import PlatformSection from '../components/sections/PlatformSection';
import LocationSection from '../components/sections/LocationSection';
import VerticalBarChart from '../components/VerticalBarChart';
import { chatService } from '../services/chatService';
import { processAgeDistribution, processGenderDistribution, processPlatformDistribution, processLocationDistribution, getTopPlatform } from '../utils/dataUtils';

const ReportsScreen = ({ navigation, currentUser }) => {
  // Extract business ID from current user (user.id is the business_id)
  // For admins, don't filter by business_id to show all patients from all tenants
  const isAdmin = currentUser?.role === 'admin';
  const businessId = isAdmin ? null : (currentUser?.id || null);
  const [activeTab, setActiveTab] = useState('patient');
  const [patients, setPatients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessMap, setBusinessMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch patients from patients table
        let patientsQuery = supabase
          .from('patients')
          .select('id, name, age, gender, phone, email, location, created_at, sender_id, platform, business_id, isbotactive')
          .order('created_at', { ascending: false });
        
        // Filter by business_id only if user is not an admin
        // For admins, show all patients from all tenants
        if (!isAdmin && businessId) {
          patientsQuery = patientsQuery.eq('business_id', businessId);
        }
        
        const { data: patientsData, error: patientsError } = await patientsQuery;

        if (patientsError) throw patientsError;
        
        console.log('Fetched patients count:', patientsData.length, isAdmin ? '(All tenants)' : `(Business: ${businessId})`);

        // Fetch latest appointment status for each patient
        const patientIds = patientsData.map(p => p.id).filter(Boolean);
        const appointmentStatusMap = {};
        
        if (patientIds.length > 0) {
          // Fetch latest appointment for each patient
          // Using appointment_details view to get patient_id and status
          let appointmentsQuery = supabase
            .from('appointment_details')
            .select('patient_id, status, appointment_created_at')
            .in('patient_id', patientIds)
            .order('appointment_created_at', { ascending: false });
          
          // Filter by business_id if not admin
          if (!isAdmin && businessId) {
            appointmentsQuery = appointmentsQuery.eq('business_id', businessId);
          }
          
          const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;
          
          if (!appointmentsError && appointmentsData) {
            // Group by patient_id and get the latest status
            appointmentsData.forEach(apt => {
              if (apt.patient_id && !appointmentStatusMap[apt.patient_id]) {
                appointmentStatusMap[apt.patient_id] = apt.status || 'pending';
              }
            });
          }
        }

        // Enrich patients with appointment status
        const enrichedPatients = patientsData.map(patient => ({
          ...patient,
          appointment_status: appointmentStatusMap[patient.id] || null
        }));

        setPatients(enrichedPatients);

        // If admin, fetch business names for all unique business_ids
        if (isAdmin && patientsData && patientsData.length > 0) {
          const uniqueBusinessIds = [...new Set(patientsData.map(p => p.business_id).filter(Boolean))];
          if (uniqueBusinessIds.length > 0) {
            const { data: businessesData, error: businessesError } = await supabase
              .from('users')
              .select('id, business_name, email')
              .in('id', uniqueBusinessIds);
            
            if (!businessesError && businessesData) {
              const map = {};
              businessesData.forEach(business => {
                map[business.id] = business;
              });
              setBusinessMap(map);
            }
          }
        }

        // Fetch chatbot conversations from chatService
        // For admins, pass null to get all conversations from all tenants
        const conversationsData = await chatService.getConversations(isAdmin ? null : businessId, 50);
        console.log('Fetched conversations count:', conversationsData.length);

        // Enrich conversations with actual patient names from patients table
        // This ensures we get the most up-to-date patient names
        const senderIds = conversationsData.map(c => c.sender_id).filter(Boolean);
        let enrichedConversations = conversationsData;
        
        if (senderIds.length > 0) {
          let patientsQuery = supabase
            .from('patients')
            .select('sender_id, name, id')
            .in('sender_id', senderIds);
          
          // For admins, don't filter by business_id to get all patients
          // For regular users, filter by business_id
          if (!isAdmin && businessId) {
            patientsQuery = patientsQuery.eq('business_id', businessId);
          }
          
          const { data: patientsData, error: patientsError } = await patientsQuery;
          
          if (!patientsError && patientsData) {
            // Create a map of sender_id to patient name
            const patientNameMap = new Map();
            patientsData.forEach(patient => {
              if (patient.sender_id && patient.name) {
                patientNameMap.set(patient.sender_id, patient.name);
              }
            });
            
            // Enrich conversations with actual patient names
            enrichedConversations = conversationsData.map(conversation => ({
              ...conversation,
              patient_name: patientNameMap.get(conversation.sender_id) || conversation.patient_name || 'Unknown Patient'
            }));
          }
        }
        
        setConversations(enrichedConversations || []);

        // If admin, fetch business names for conversations
        if (isAdmin && enrichedConversations && enrichedConversations.length > 0) {
          const uniqueBusinessIds = [...new Set(enrichedConversations.map(c => c.business_id).filter(Boolean))];
          if (uniqueBusinessIds.length > 0) {
            // Merge with existing businessMap using functional update
            const { data: businessesData, error: businessesError } = await supabase
              .from('users')
              .select('id, business_name, email')
              .in('id', uniqueBusinessIds);
            
            if (!businessesError && businessesData) {
              setBusinessMap(prevMap => {
                const newMap = { ...prevMap };
                businessesData.forEach(business => {
                  newMap[business.id] = business;
                });
                return newMap;
              });
            }
          }
        }

        // Fetch chat_history data for analytics
        let chatHistoryQuery = supabase
          .from('chat_history')
          .select('id, sender_id, text, platform, role, created_at, business_id')
          .order('created_at', { ascending: false });
        
        // Filter by business_id if not admin
        if (!isAdmin && businessId) {
          chatHistoryQuery = chatHistoryQuery.eq('business_id', businessId);
        }
        
        const { data: chatHistoryData, error: chatHistoryError } = await chatHistoryQuery;
        
        if (!chatHistoryError && chatHistoryData) {
          setChatHistory(chatHistoryData);
        } else {
          setChatHistory([]);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setPatients([]);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handlePatientPress = (patient) => {
    console.log('Patient pressed:', patient);
    // TODO: Navigate to patient details or implement patient actions
  };

  const handleConversationPress = async (conversation) => {
    console.log('Conversation pressed:', conversation);
    
    // If conversation has a sender_id, fetch appointment details and navigate
    if (conversation.sender_id && navigation) {
      try {
        // Try to find an appointment linked to this sender_id
        const { data, error } = await supabase
          .from('appointment_details')
          .select('*')
          .eq('sender_id', conversation.sender_id)
          .order('appointment_created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        // Navigate to AppointmentDetailsScreen with the appointment data
        navigation.navigate('AppointmentDetailsScreen', { appointment: data });
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        // If no appointment found, just show an alert
        Alert.alert('Information', 'No appointment found for this conversation.');
      }
    }
  };

  // Process analytics data from patients
  const processAnalyticsData = () => {
    if (!patients || patients.length === 0) {
      return {
        totalPatients: 0,
        platformDistribution: {},
        genderDistribution: { Male: 0, Female: 0, Other: 0 },
        ageDistribution: { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 },
        locationDistribution: {},
        monthlyGrowth: { data: [], labels: [], colors: [] },
        topPlatform: 'No Platforms',
        topBusiness: 'No Business'
      };
    }

    // Platform distribution
    const platformCounts = {};
    patients.forEach(patient => {
      const platform = patient.platform || 'Unknown';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    // Gender distribution
    const genderCounts = { Male: 0, Female: 0, Other: 0 };
    patients.forEach(patient => {
      const gender = (patient.gender || 'Other').trim();
      if (gender.toLowerCase() === 'male') genderCounts.Male++;
      else if (gender.toLowerCase() === 'female') genderCounts.Female++;
      else genderCounts.Other++;
    });

    // Age distribution
    const ageGroups = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
    patients.forEach(patient => {
      const age = parseInt(patient.age) || 0;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 55) ageGroups['36-55']++;
      else ageGroups['56+']++;
    });

    // Location distribution
    const locationCounts = {};
    patients.forEach(patient => {
      const location = patient.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    // Monthly growth (last 6 months)
    const monthlyCounts = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    patients.forEach(patient => {
      const createdDate = new Date(patient.created_at);
      if (createdDate >= sixMonthsAgo) {
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      }
    });

    const monthlyData = Object.values(monthlyCounts);
    const monthlyLabels = Object.keys(monthlyCounts).map(label => {
      const [year, month] = label.split('-');
      return `${month}/${year.slice(-2)}`;
    });
    const monthlyColors = ['#FF9F43', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

    // Top platform
    const topPlatform = getTopPlatform(platformCounts);

    // Top business (business with most patients)
    const businessCounts = {};
    patients.forEach(patient => {
      if (patient.business_id) {
        businessCounts[patient.business_id] = (businessCounts[patient.business_id] || 0) + 1;
      }
    });
    const topBusinessId = Object.entries(businessCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
    const topBusiness = topBusinessId && businessMap[topBusinessId] 
      ? (businessMap[topBusinessId].business_name || businessMap[topBusinessId].email || 'Unknown')
      : 'No Business';

    return {
      totalPatients: patients.length,
      platformDistribution: platformCounts,
      genderDistribution: genderCounts,
      ageDistribution: ageGroups,
      locationDistribution: locationCounts,
      monthlyGrowth: { data: monthlyData, labels: monthlyLabels, colors: monthlyColors },
      topPlatform,
      topBusiness
    };
  };

  const renderPatientAnalytics = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text} />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      );
    }

    const analyticsData = processAnalyticsData();

    return (
      <View style={styles.tabContent}>
        {/* Patient Table */}
        <PatientSection 
          patients={patients} 
          onRowPress={handlePatientPress}
          showBusiness={isAdmin}
          businessMap={businessMap}
        />
        
        {/* Patient Analytics Header with Filters */}
        <View style={styles.patientHeader}>
          <Text style={styles.patientTitle}>
            {isAdmin ? 'Global Patient Analytics' : 'Patient Analytics'}
          </Text>
          <View style={styles.filterContainer}>
            <View style={styles.filterWrapper}>
              <Ionicons name="calendar" size={16} color={Colors.textSecondary} style={styles.filterIcon} />
              <View style={styles.selectContainer}>
                <Text style={styles.selectText}>Last 30 days</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </View>
            </View>
            <View style={styles.filterWrapper}>
              <Ionicons name="globe" size={16} color={Colors.textSecondary} style={styles.filterIcon} />
              <View style={styles.selectContainer}>
                <Text style={styles.selectText}>All Platforms</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </View>
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.patientSummaryCards}>
          <View style={styles.patientSummaryCard}>
            <Text style={styles.patientSummaryCardTitle}>Total Patients</Text>
            <Text style={styles.patientSummaryCardValue}>{analyticsData.totalPatients}</Text>
            <Text style={styles.patientSummaryCardChange}>Across all tenants</Text>
          </View>
          <View style={styles.patientSummaryCard}>
            <Text style={styles.patientSummaryCardTitle}>Top Business</Text>
            <Text style={styles.patientSummaryCardValue} numberOfLines={1}>
              {analyticsData.topBusiness}
            </Text>
            <Text style={styles.patientSummaryCardChange}>Most patients</Text>
          </View>
          <View style={styles.patientSummaryCard}>
            <Text style={styles.patientSummaryCardTitle}>Top Platforms</Text>
            <Text style={styles.patientSummaryCardValue} numberOfLines={1}>
              {analyticsData.topPlatform}
            </Text>
            <Text style={styles.patientSummaryCardChange}>Most used platform</Text>
          </View>
        </View>

        {/* Charts Section - Three columns in one row */}
        <View style={styles.patientChartsSection}>
          {/* Platform Usage */}
          <View style={styles.patientChartCard}>
            <Text style={styles.patientChartCardTitle}>Platform Usage</Text>
            <PlatformSection platformDistribution={analyticsData.platformDistribution} />
          </View>

          {/* Demographics */}
          <View style={styles.patientChartCard}>
            <Text style={styles.patientChartCardTitle}>Demographics</Text>
            <DemographicsSection
              ageDistribution={analyticsData.ageDistribution}
              genderDistribution={analyticsData.genderDistribution}
            />
          </View>

          {/* Location Distribution */}
          <View style={styles.patientChartCard}>
            <Text style={styles.patientChartCardTitle}>Location</Text>
            <LocationSection locationDistribution={analyticsData.locationDistribution} />
          </View>
        </View>
      </View>
    );
  };

  // Process chatbot analytics data from chat_history
  const processChatbotAnalytics = () => {
    if (!chatHistory || chatHistory.length === 0) {
      return {
        inquiryVolume: 0,
        successfulSchedulingRate: 0,
        incompleteSchedulingRate: 0,
        platformDistribution: {},
        dailyInquiries: { data: [], labels: [], colors: [] }
      };
    }

    // Filter user messages (inquiries)
    const userMessages = chatHistory.filter(msg => msg.role === 'user');
    const inquiryVolume = userMessages.length;

    // Calculate successful scheduling rate
    // A conversation is successful if it has both user and bot messages
    const senderIds = [...new Set(chatHistory.map(msg => msg.sender_id))];
    let successfulConversations = 0;
    let totalConversations = 0;

    senderIds.forEach(senderId => {
      const messages = chatHistory.filter(msg => msg.sender_id === senderId);
      const hasUser = messages.some(msg => msg.role === 'user');
      const hasBot = messages.some(msg => msg.role === 'bot');
      
      if (hasUser) {
        totalConversations++;
        if (hasBot) {
          successfulConversations++;
        }
      }
    });

    const successfulSchedulingRate = totalConversations > 0 
      ? Math.round((successfulConversations / totalConversations) * 100) 
      : 0;
    const incompleteSchedulingRate = 100 - successfulSchedulingRate;

    // Platform distribution
    const platformCounts = {};
    userMessages.forEach(msg => {
      const platform = msg.platform || 'Unknown';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    // Daily inquiries (last 30 days)
    const dailyCounts = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    userMessages.forEach(msg => {
      const msgDate = new Date(msg.created_at);
      if (msgDate >= thirtyDaysAgo) {
        const dateKey = msgDate.toISOString().split('T')[0]; // YYYY-MM-DD
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      }
    });

    // Sort dates and prepare chart data
    const sortedDates = Object.keys(dailyCounts).sort();
    const dailyData = sortedDates.map(date => dailyCounts[date]);
    const dailyLabels = sortedDates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const dailyColors = ['#4A90E2', '#5BA0F2', '#6BB0FF', '#9CC9FF', '#AAD9FF'];

    return {
      inquiryVolume,
      successfulSchedulingRate,
      incompleteSchedulingRate,
      platformDistribution: platformCounts,
      dailyInquiries: { data: dailyData, labels: dailyLabels, colors: dailyColors }
    };
  };

  const renderChatbotAnalytics = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.text} />
          <Text style={styles.loadingText}>Loading chatbot data...</Text>
        </View>
      );
    }

    const chatbotAnalytics = processChatbotAnalytics();

    return (
    <View style={styles.tabContent}>
        {/* Chatbot Conversation Table */}
        <ChatbotConversationSection 
          conversations={conversations} 
          onRowPress={handleConversationPress}
          showBusiness={isAdmin}
          businessMap={businessMap}
        />

      {/* Header with Filters */}
      <View style={styles.chatbotHeader}>
        <Text style={styles.chatbotTitle}>
          {isAdmin ? 'Global Chatbot Performance' : 'Chatbot Performance'}
        </Text>
        <View style={styles.filterContainer}>
          <View style={styles.filterWrapper}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} style={styles.filterIcon} />
            <View style={styles.selectContainer}>
              <Text style={styles.selectText}>Last 30 days</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </View>
          </View>
          <View style={styles.filterWrapper}>
            <Ionicons name="globe" size={16} color={Colors.textSecondary} style={styles.filterIcon} />
            <View style={styles.selectContainer}>
              <Text style={styles.selectText}>All Platforms</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </View>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Inquiry Volume</Text>
            <Text style={styles.summaryCardValue}>{chatbotAnalytics.inquiryVolume.toLocaleString()}</Text>
            <Text style={styles.summaryCardChange}>
              {isAdmin ? 'Across all tenants' : 'Total user inquiries'}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Successful Scheduling Rate</Text>
            <Text style={styles.summaryCardValue}>{chatbotAnalytics.successfulSchedulingRate}%</Text>
            <Text style={styles.summaryCardChange}>Conversations with bot response</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Incomplete Scheduling Rate</Text>
            <Text style={styles.summaryCardValue}>{chatbotAnalytics.incompleteSchedulingRate}%</Text>
            <Text style={[styles.summaryCardChange, styles.negativeChange]}>No bot response</Text>
          </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        {/* Inquiry Volume Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartCardTitle}>Inquiry Volume Over Time</Text>
            {chatbotAnalytics.dailyInquiries.data.length > 0 ? (
              <VerticalBarChart
                data={chatbotAnalytics.dailyInquiries.data}
                labels={chatbotAnalytics.dailyInquiries.labels}
                colors={chatbotAnalytics.dailyInquiries.colors}
                title="Daily Inquiries"
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart" size={48} color={Colors.textSecondary} />
                <Text style={styles.chartPlaceholderText}>No inquiry data available</Text>
              </View>
            )}
          </View>

          {/* Platform Breakdown Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartCardTitle}>Inquiries by Platform</Text>
            {Object.keys(chatbotAnalytics.platformDistribution).length > 0 ? (
              <PlatformSection platformDistribution={chatbotAnalytics.platformDistribution} />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Ionicons name="pie-chart" size={48} color={Colors.textSecondary} />
                <Text style={styles.chartPlaceholderText}>No platform data available</Text>
              </View>
            )}
          </View>
      </View>
    </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>{isAdmin ? 'Global Reports' : 'Reports'}</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>{isAdmin ? 'Global Reports' : 'Reports'}</Text>
      <Text style={styles.subheader}>
        {isAdmin 
          ? 'Analyze patient data and chatbot performance across all tenants' 
          : 'Analyze patient data and chatbot performance'}
      </Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'patient' && styles.activeTabItem
            ]}
            onPress={() => handleTabPress('patient')}
          >
            <Text style={[
              styles.tabLabel,
              activeTab === 'patient' && styles.activeTabLabel
            ]}>
              Patient Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'chatbot' && styles.activeTabItem
            ]}
            onPress={() => handleTabPress('chatbot')}
          >
            <Text style={[
              styles.tabLabel,
              activeTab === 'chatbot' && styles.activeTabLabel
            ]}>
              Chatbot Performance
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'patient' ? renderPatientAnalytics() : renderChatbotAnalytics()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    paddingTop: Layout.spacing.xl,
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
    paddingHorizontal: Layout.spacing.xl,
  },
  subheader: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
    lineHeight: 24,
    paddingHorizontal: Layout.spacing.xl,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
  },
  tabNav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: Layout.spacing.xl,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
    lineHeight: 24,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  analyticsContainer: {
    marginTop: Layout.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  // Chatbot Performance Styles
  chatbotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  chatbotTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    alignItems: 'center',
  },
  filterWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 140,
  },
  filterIcon: {
    marginRight: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  summaryCardChange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981', // Green color for positive changes
  },
  negativeChange: {
    color: '#EF4444', // Red color for negative changes
  },
  chartsSection: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    flexWrap: 'wrap',
  },
  chartCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  chartPlaceholder: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Patient Analytics Styles
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  patientTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  patientSummaryCards: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    flexWrap: 'wrap',
  },
  patientSummaryCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patientSummaryCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  patientSummaryCardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  patientSummaryCardChange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981', // Green color for positive changes
  },
  patientChartsSection: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    flexWrap: 'wrap',
  },
  patientChartCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patientChartCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
});

export default ReportsScreen;
