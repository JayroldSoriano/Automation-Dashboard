import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import PatientSection from '../components/sections/PatientSection';
import ChatbotConversationSection from '../components/sections/ChatbotConversationSection';
import CircularSegmentedChart from '../components/CircularSegmentedChart';
import VerticalBarChart from '../components/VerticalBarChart';
import HorizontalSegmentedBar from '../components/HorizontalSegmentedBar';
import StatCard from '../components/StatCard';

const ReportsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('patient');
  const [patients, setPatients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch patients from patients table
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, name, age, gender, phone, email, location, profilepicture, created_at, sender_id, last_agent, platform')
          .order('created_at', { ascending: false });

        if (patientsError) throw patientsError;
        
        console.log('Fetched patients count:', patientsData.length);
        setPatients(patientsData);

        // Fetch chatbot conversations (mock data for now since we don't have a conversations table)
        const mockConversations = [
          {
            session_id: 'SESS-001',
            patient_name: 'John Doe',
            last_message: 'I need to schedule an appointment for next week',
            last_ai_reply: 'I can help you schedule an appointment. What day works best for you?',
            timestamp: new Date().toISOString()
          },
          {
            session_id: 'SESS-002',
            patient_name: 'Jane Smith',
            last_message: 'What are your available time slots?',
            last_ai_reply: 'We have slots available at 9 AM, 2 PM, and 4 PM. Which would you prefer?',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            session_id: 'SESS-003',
            patient_name: 'Mike Johnson',
            last_message: 'I want to cancel my appointment',
            last_ai_reply: 'I can help you cancel your appointment. What is your appointment ID?',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            session_id: 'SESS-004',
            patient_name: 'Sarah Wilson',
            last_message: 'How much does a cleaning cost?',
            last_ai_reply: 'Our basic cleaning starts at $120. Would you like to schedule a consultation?',
            timestamp: new Date(Date.now() - 10800000).toISOString()
          },
          {
            session_id: 'SESS-005',
            patient_name: 'David Brown',
            last_message: 'I have a toothache, is this an emergency?',
            last_ai_reply: 'Toothaches can be serious. I recommend calling our emergency line at (555) 123-4567.',
            timestamp: new Date(Date.now() - 14400000).toISOString()
          },
          {
            session_id: 'SESS-006',
            patient_name: 'Lisa Garcia',
            last_message: 'Can I reschedule my appointment from tomorrow to next week?',
            last_ai_reply: 'Of course! I can help you reschedule. What day next week works for you?',
            timestamp: new Date(Date.now() - 18000000).toISOString()
          },
          {
            session_id: 'SESS-007',
            patient_name: 'Robert Taylor',
            last_message: 'Do you accept insurance?',
            last_ai_reply: 'Yes, we accept most major insurance plans. What insurance do you have?',
            timestamp: new Date(Date.now() - 21600000).toISOString()
          },
          {
            session_id: 'SESS-008',
            patient_name: 'Maria Rodriguez',
            last_message: 'I need a root canal, how long does it take?',
            last_ai_reply: 'Root canals typically take 1-2 hours. Would you like to schedule an evaluation first?',
            timestamp: new Date(Date.now() - 25200000).toISOString()
          },
          {
            session_id: 'SESS-009',
            patient_name: 'James Anderson',
            last_message: 'What are your office hours?',
            last_ai_reply: 'We\'re open Monday-Friday 8AM-6PM and Saturday 9AM-2PM. Closed Sundays.',
            timestamp: new Date(Date.now() - 28800000).toISOString()
          },
          {
            session_id: 'SESS-010',
            patient_name: 'Emily Davis',
            last_message: 'I lost my filling, what should I do?',
            last_ai_reply: 'Please call us immediately at (555) 123-4567. Lost fillings need prompt attention.',
            timestamp: new Date(Date.now() - 32400000).toISOString()
          },
          {
            session_id: 'SESS-011',
            patient_name: 'Michael White',
            last_message: 'Can I get a quote for teeth whitening?',
            last_ai_reply: 'Our professional whitening starts at $300. Would you like to schedule a consultation?',
            timestamp: new Date(Date.now() - 36000000).toISOString()
          },
          {
            session_id: 'SESS-012',
            patient_name: 'Jennifer Lee',
            last_message: 'Do you have any appointments available today?',
            last_ai_reply: 'Let me check our schedule. We have a 2 PM slot available. Would that work?',
            timestamp: new Date(Date.now() - 39600000).toISOString()
          },
          {
            session_id: 'SESS-013',
            patient_name: 'Christopher Moore',
            last_message: 'I need to update my contact information',
            last_ai_reply: 'I can help you update your information. What\'s your new phone number?',
            timestamp: new Date(Date.now() - 43200000).toISOString()
          },
          {
            session_id: 'SESS-014',
            patient_name: 'Amanda Clark',
            last_message: 'How often should I come for cleanings?',
            last_ai_reply: 'We recommend cleanings every 6 months. When was your last cleaning?',
            timestamp: new Date(Date.now() - 46800000).toISOString()
          },
          {
            session_id: 'SESS-015',
            patient_name: 'Daniel Lewis',
            last_message: 'I have braces, do you work with orthodontists?',
            last_ai_reply: 'Yes, we coordinate with orthodontists. We can provide general dental care during your treatment.',
            timestamp: new Date(Date.now() - 50400000).toISOString()
          }
        ];

        console.log('Fetched conversations count:', mockConversations.length);
        setConversations(mockConversations);

      } catch (err) {
        console.error('Error fetching data:', err);
        setPatients([]);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handlePatientPress = (patient) => {
    console.log('Patient pressed:', patient);
    // TODO: Navigate to patient details or implement patient actions
  };

  const handleConversationPress = (conversation) => {
    console.log('Conversation pressed:', conversation);
    // TODO: Navigate to conversation details or implement conversation actions
  };

  // Process analytics data from patients
  const processAnalyticsData = () => {
    if (!patients || patients.length === 0) {
      return {
        totalPatients: 0,
        platformDistribution: { data: [], labels: [], colors: [] },
        genderDistribution: { data: [], labels: [], colors: [] },
        ageDistribution: { data: [], labels: [], colors: [] },
        monthlyGrowth: { data: [], labels: [], colors: [] }
      };
    }

    // Platform distribution
    const platformCounts = {};
    patients.forEach(patient => {
      const platform = patient.platform || 'Unknown';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    const platformData = Object.values(platformCounts);
    const platformLabels = Object.keys(platformCounts);
    const platformColors = ['#4A90E2', '#5BA0F2', '#6BB0FF', '#9CC9FF', '#AAD9FF'];

    // Gender distribution
    const genderCounts = {};
    patients.forEach(patient => {
      const gender = patient.gender || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    const genderData = Object.values(genderCounts);
    const genderLabels = Object.keys(genderCounts);
    const genderColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

    // Age distribution
    const ageGroups = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
    patients.forEach(patient => {
      const age = parseInt(patient.age) || 0;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 55) ageGroups['36-55']++;
      else ageGroups['56+']++;
    });

    const ageData = Object.values(ageGroups);
    const ageLabels = Object.keys(ageGroups);
    const ageColors = ['#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

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

    return {
      totalPatients: patients.length,
      platformDistribution: { data: platformData, labels: platformLabels, colors: platformColors },
      genderDistribution: { data: genderData, labels: genderLabels, colors: genderColors },
      ageDistribution: { data: ageData, labels: ageLabels, colors: ageColors },
      monthlyGrowth: { data: monthlyData, labels: monthlyLabels, colors: monthlyColors }
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
        />
        
        {/* Patient Analytics Header with Filters */}
        <View style={styles.patientHeader}>
          <Text style={styles.patientTitle}>Patient Analytics</Text>
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
            <Text style={styles.patientSummaryCardChange}>+12% vs last month</Text>
          </View>
          <View style={styles.patientSummaryCard}>
            <Text style={styles.patientSummaryCardTitle}>New Patients</Text>
            <Text style={styles.patientSummaryCardValue}>124</Text>
            <Text style={styles.patientSummaryCardChange}>+8% vs last month</Text>
          </View>
          <View style={styles.patientSummaryCard}>
            <Text style={styles.patientSummaryCardTitle}>Returning Patients</Text>
            <Text style={styles.patientSummaryCardValue}>732</Text>
            <Text style={styles.patientSummaryCardChange}>+10% vs last month</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.patientChartsSection}>
          {/* Patient Growth Chart */}
          <View style={styles.patientChartCard}>
            <Text style={styles.patientChartCardTitle}>Patient Growth Over Time</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="trending-up" size={48} color={Colors.textSecondary} />
              <Text style={styles.chartPlaceholderText}>Patient Growth Chart</Text>
              <Text style={styles.chartPlaceholderSubtext}>Line chart showing patient growth trends</Text>
            </View>
          </View>

          {/* Demographics Chart */}
          <View style={styles.patientChartCard}>
            <Text style={styles.patientChartCardTitle}>Demographics</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="pie-chart" size={48} color={Colors.textSecondary} />
              <Text style={styles.chartPlaceholderText}>Demographics Chart</Text>
              <Text style={styles.chartPlaceholderSubtext}>Pie chart showing demographic distribution</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderChatbotAnalytics = () => (
    <View style={styles.tabContent}>
      {/* Chatbot Conversation Table */}
      <ChatbotConversationSection 
        conversations={conversations} 
        onRowPress={handleConversationPress}
      />

      {/* Header with Filters */}
      <View style={styles.chatbotHeader}>
        <Text style={styles.chatbotTitle}>Chatbot Performance</Text>
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
          <Text style={styles.summaryCardValue}>1,284</Text>
          <Text style={styles.summaryCardChange}>+15% vs last period</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Successful Scheduling Rate</Text>
          <Text style={styles.summaryCardValue}>72%</Text>
          <Text style={styles.summaryCardChange}>+5% vs last period</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Incomplete Scheduling Rate</Text>
          <Text style={styles.summaryCardValue}>28%</Text>
          <Text style={[styles.summaryCardChange, styles.negativeChange]}>-5% vs last period</Text>
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        {/* Inquiry Volume Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Inquiry Volume Over Time</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color={Colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>Inquiry Volume Chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>Line chart showing daily inquiry trends</Text>
          </View>
        </View>

        {/* Platform Breakdown Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Inquiries by Platform</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="pie-chart" size={48} color={Colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>Platform Breakdown</Text>
            <Text style={styles.chartPlaceholderSubtext}>Pie chart showing platform distribution</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Reports</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Reports</Text>
      <Text style={styles.subheader}>Analyze patient data and chatbot performance</Text>

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
