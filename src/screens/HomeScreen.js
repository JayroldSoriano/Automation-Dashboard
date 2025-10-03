import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Section from '../components/Section';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import PieChart from '../components/PieChart';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { HomeViewModel } from '../viewmodels/HomeViewModel';
import { TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  const [viewState, setViewState] = useState({
    inquiries: 0,
    errors: 0,
    isLoading: false,
    lastUpdated: null
  });
  
  const viewModelRef = useRef(null);

  useEffect(() => {
    // Initialize ViewModel
    viewModelRef.current = new HomeViewModel();
    
    // Add listener for state changes
    const handleStateChange = (newState) => {
      setViewState(newState);
    };
    
    viewModelRef.current.addListener(handleStateChange);
    
    // Load initial data
    viewModelRef.current.loadDashboardData();
    
    // Poll every 5 seconds to refresh data (instead of realtime)
    const intervalId = setInterval(() => {
      if (viewModelRef.current) {
        viewModelRef.current.refreshData();
      }
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      if (viewModelRef.current) {
        viewModelRef.current.destroy();
      }
      clearInterval(intervalId);
    };
  }, []);

  const handleRefresh = async () => {
    if (viewModelRef.current) {
      await viewModelRef.current.refreshData();
    }
  };

  const formatTime12h = (scheduledTime) => {
    if (!scheduledTime) return '—';
    try {
      const [h, m] = scheduledTime.split(':');
      const hours = parseInt(h, 10);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${m} ${period}`;
    } catch {
      return scheduledTime;
    }
  };
  
  const getTimePassed = (createdAt) => {
    if (!createdAt) return '0 hours';
    const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (hours < 730) {
      const weeks = Math.floor(hours / 168);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else {
      const months = Math.floor(hours / 730);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
  };

  const [activeTab, setActiveTab] = useState('Table'); // 'Table' | 'Expanded'
  const appts = useMemo(() => (viewState.recentAppointments || []), [viewState.recentAppointments]);
  const toggleView = () => setActiveTab((prev) => (prev === 'Table' ? 'Expanded' : 'Table'));
  const toggleIcon = activeTab === 'Table' ? 'view-grid' : 'view-list'; // MaterialCommunityIcons names

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={viewState.isLoading}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}> 
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of key metrics and trends in automated processes.</Text>
        </View>

        <View style={styles.topStatsRow}>
          <StatCard title="Total Patients" value={viewState.totalPatients} style={styles.flexItem} />
          <StatCard title="Automations Running" value={viewState.automationsRunning} style={styles.flexItem} />
          <StatCard title="Appointments Scheduled" value={viewState.appointmentsScheduled} style={styles.flexItem} />
        </View>

        <View style={styles.gridRow}>
          <Section title="Patient Demographics" style={[styles.flexItem, styles.gridItem]}>
            <View style={styles.demographicsRow}>
              <View style={styles.demographicBlockCentered}>
                {(() => {
                  const ages = viewState.ageDistribution || { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
                  const ageData = [ages['0-18'], ages['19-35'], ages['36-55'], ages['56+']];
                  const ageLabels = ['0-18', '19-35', '36-55', '56+'];
                  return <PieChart title="Age" data={ageData} labels={ageLabels} size={140} />;
                })()}
              </View>
              <View style={styles.demographicBlockCentered}>
                {(() => {
                  const genders = viewState.genderDistribution || { Male: 0, Female: 0, Other: 0 };
                  const genderData = [genders.Male, genders.Female, genders.Other];
                  const genderLabels = ['Male', 'Female', 'Other'];
                  return <PieChart title="Gender" data={genderData} labels={genderLabels} size={140} colors={[Colors.primary, Colors.pink, Colors.success]} />;
                })()}
              </View>
            </View>
          </Section>

          <Section title="Platform Usage" style={[styles.flexItem, styles.gridItem]}>
            <ProgressBar label="Platform A" value={80} />
            <ProgressBar label="Platform B" value={30} color={Colors.secondary} />
            <ProgressBar label="Platform C" value={65} color={Colors.success} />
          </Section>
        </View>

        <Section title="Scheduling Success Rate" style={styles.wideSection}>
          <ProgressBar 
            label={`Success (${viewState.appointmentsScheduled || 0}/${(viewState.recentAppointments || []).length})`} 
            value={viewState.schedulingSuccessRate || 0}
            color={Colors.primary}
            trackColor={Colors.error}
          />
        </Section>

        <Section
      title="Appointments"
      style={styles.wideSection}
      right={
        <IconButton
          icon={toggleIcon}
          size={22}
          animated
          onPress={toggleView}
          accessibilityLabel={activeTab === 'Table' ? 'Switch to expanded cards' : 'Switch to table view'}
        />
      }
    >
      <View style={styles.sectionInner}>
        {activeTab === 'Table' ? (
          <DataTable
            columns={['DATE', 'TIME', 'PATIENT NAME', 'SERVICE', 'STATUS']}
            data={appts.slice(0, 10).map((appt) => {
              const date = appt.scheduled_date || (appt.created_at ? appt.created_at.split('T')[0] : '');
              const time = appt.scheduled_time || '';
              const name = appt.patient_name || '—';
              const service = appt.service_name || '—';
              const status = (appt.status || '').toLowerCase();
              const label = appt.status || '—';
              return [
                date,
                time,
                name,
                service,
                <StatusBadge key={appt.id} status={status} label={label} />,
              ];
            })}
          />
        ) : (
          <View style={styles.expandedRow}>
            {appts.slice(0, 12).map((appt, idx) => {
              const date = appt.scheduled_date || (appt.created_at ? appt.created_at.split('T')[0] : '—');
              const time = formatTime12h(appt.scheduled_time);
              const timePassed = getTimePassed(appt.created_at);

              return (
                <Card key={`appt-card-${appt.appointment_id || idx}`} style={styles.expandedCard}>
                  <View style={styles.headerRow}>
                    <Text numberOfLines={1} style={styles.cardName}>
                      {appt.patient_name || 'Unknown Patient'}
                    </Text>
                    <Text style={styles.timePassedText}>{timePassed} ago</Text>
                  </View>

                  <Text style={styles.inquiryNumber}>
                    Inquiry #: {appt.appointment_id || idx + 1}
                  </Text>

                  <View style={styles.dividerThin} />

                  <View style={styles.headerRowInner}>
                    <Text numberOfLines={1} style={styles.expandedTitleSmall}>Service Name:</Text>
                    <Text numberOfLines={1} style={styles.expandedSubtitle}>
                      {appt.service_name || '—'}
                    </Text>
                  </View>

                  <View style={styles.headerRowInner}>
                    <Text numberOfLines={1} style={styles.expandedTitleSmall}>Category:</Text>
                    <Text numberOfLines={1} style={styles.expandedSubtitle}>
                      {appt.service_category || '—'}
                    </Text>
                  </View>

                  <View style={styles.headerRowInner}>
                    <Text numberOfLines={1} style={styles.expandedTitleSmall}>Price:</Text>
                    <Text numberOfLines={1} style={styles.expandedSubtitle}>
                      ${appt.service_price || '—'}
                    </Text>
                  </View>

                  <View style={styles.dividerThin} />

                  <View style={styles.bottomRow}>
                    <View style={styles.appointmentRequestCol}>
                      <Text style={styles.appointmentRequestLabel}>Appointment Request</Text>
                      <Text style={styles.appointmentDate}>{date} @ {time}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </Section>
        {/* Quick Actions removed as requested */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Layout.spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  topStatsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  flexItem: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  demographicsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  demographicBlock: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  demographicBlockCentered: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    marginTop: Layout.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionsCard: {
    marginBottom: Layout.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    fontStyle: 'italic',
  },
  wideSection: {
    marginTop: Layout.spacing.md,
  },
  expandedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16, 
  },
  expandedCard: {
    width: '31%',
    minWidth: 280,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  headerRowInner: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  expandedTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  expandedSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  timePassedText: {
    fontSize: 12,
    color: '#666',
    flexShrink: 0,
  },
  dividerThin: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  inquiryNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCategory: {
    fontSize: 13,
    color: '#666',
  },
  priceDetails: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  appointmentRequestCol: {
    flex: 1,
  },
  appointmentRequestLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F1F1F3',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabLabel: {
    color: '#3B3B3B',
    fontSize: 14,
  },
  tabLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },
});
export default HomeScreen;
