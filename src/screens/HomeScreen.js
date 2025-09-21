import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
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
          <Text style={styles.title}>Automation Dashboard</Text>
          <Text style={styles.subtitle}>Welcome to your automation hub</Text>
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{viewState.inquiries}</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{viewState.errors}</Text>
              <Text style={styles.statLabel}>Errors</Text>
            </View>
          </View>
          {viewState.lastUpdated && (
            <Text style={styles.lastUpdatedText}>
              Last updated: {viewState.lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </Card>

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
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: Layout.spacing.md,
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
});

export default HomeScreen;
