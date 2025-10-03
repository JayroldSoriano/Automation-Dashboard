import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
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

        <Section title="Appointment Details" style={styles.wideSection}>
          <DataTable 
            columns={["DATE","TIME","PATIENT NAME","SERVICE","STATUS"]}
            data={(viewState.recentAppointments || []).slice(0, 10).map((appt) => {
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
                <StatusBadge key={appt.id} status={status} label={label} />
              ];
            })}
          />
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
  chartPlaceholder: {
    height: 180,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
  },
});

export default HomeScreen;
