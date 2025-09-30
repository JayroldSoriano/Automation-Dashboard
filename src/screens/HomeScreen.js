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
    
    // Start real-time updates
    viewModelRef.current.startRealTimeUpdates();
    
    // Cleanup on unmount
    return () => {
      if (viewModelRef.current) {
        viewModelRef.current.destroy();
      }
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
          <StatCard title="Total Patients" value={1250} style={styles.flexItem} />
          <StatCard title="Automations Running" value={15} style={styles.flexItem} />
          <StatCard title="Appointments Scheduled" value={875} style={styles.flexItem} />
        </View>

        <View style={styles.gridRow}>
          <Section title="Patient Demographics" style={[styles.flexItem, styles.gridItem]}>
            <View style={styles.demographicsRow}>
              <View style={styles.demographicBlock}><Text style={styles.cardText}>Age Distribution</Text></View>
              <View style={styles.demographicBlock}><Text style={styles.cardText}>Gender Distribution</Text></View>
            </View>
            <View style={styles.legendRow}>
              {['0-18','19-35','36-55','56+','Male','Female','Other'].map((l)=> (
                <Text key={l} style={styles.legendText}>{l}</Text>
              ))}
            </View>
          </Section>

          <Section title="Platform Usage" style={[styles.flexItem, styles.gridItem]}>
            <ProgressBar label="Platform A" value={80} />
            <ProgressBar label="Platform B" value={30} color={Colors.secondary} />
            <ProgressBar label="Platform C" value={65} color={Colors.success} />
          </Section>
        </View>

        <Section title="Scheduling Success Rate" style={styles.wideSection}>
          <View style={styles.chartPlaceholder} />
        </Section>

        <Section title="Appointment Details" style={styles.wideSection}>
          <DataTable 
            columns={["DATE","TIME","PATIENT NAME","SERVICE","STATUS"]}
            data={[
              ['2024-07-15','10:00 AM','Sophia Clark','Cleaning', <StatusBadge key="1" status="confirmed" label="Confirmed" />],
              ['2024-07-15','11:30 AM','Ethan Harris','Checkup', <StatusBadge key="2" status="completed" label="Completed" />],
              ['2024-07-16','09:00 AM','Olivia Turner','Filling', <StatusBadge key="3" status="confirmed" label="Confirmed" />],
              ['2024-07-16','02:00 PM','Liam Foster','Extraction', <StatusBadge key="4" status="cancelled" label="Cancelled" />],
              ['2024-07-17','10:00 AM','Ava Bennett','Braces', <StatusBadge key="5" status="confirmed" label="Confirmed" />],
            ]}
          />
        </Section>

        <Card style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              title="Create Automation"
              variant="primary"
              size="medium"
              onPress={() => console.log('Create automation pressed')}
              style={styles.actionButton}
            />
            <Button
              title="View History"
              variant="outline"
              size="medium"
              onPress={() => console.log('View history pressed')}
              style={styles.actionButton}
            />
          </View>
          {viewState.lastUpdated && (
            <Text style={styles.lastUpdatedText}>
              Last updated: {viewState.lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </Card>
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
    height: 120,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
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
