import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';

// Components
import Section from '../components/Section';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import DemographicsSection from '../components/sections/DemographicsSection';
import PlatformSection from '../components/sections/PlatformSection';
import ServicesSection from '../components/sections/ServicesSection';
import LocationSection from '../components/sections/LocationSection';
import AppointmentsSection from '../components/sections/AppointmentsSection';

// Hooks and Utils
import { useHomeScreen } from '../hooks/useHomeScreen';

// Constants and Styles
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { homeScreenStyles } from '../styles/HomeScreenStyles';

/**
 * HomeScreen component - Main dashboard screen displaying key metrics and data
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @returns {JSX.Element} HomeScreen component
 */
const HomeScreen = ({ navigation }) => {
  const {
    viewState,
    activeTab,
    openMenuId,
    toggleView,
    toggleIcon,
    handleMenuOpen,
    handleMenuClose,
    handleMenuAction
  } = useHomeScreen();

  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <ScrollView
        contentContainerStyle={homeScreenStyles.scrollContent}
        showsHorizontalScrollIndicator={false}
        horizontal={false}
      >
        {/* Header Section */}
        <View style={homeScreenStyles.header}>
          <Text style={homeScreenStyles.title}>Dashboard</Text>
          <Text style={homeScreenStyles.subtitle}>
            Overview of key metrics and trends in automated processes.
          </Text>
        </View>

        {/* Top Statistics Row */}
        <View style={homeScreenStyles.topStatsRow}>
          <StatCard 
            title="Total Patients" 
            value={viewState.totalPatients} 
            style={homeScreenStyles.flexItem} 
          />
          <StatCard 
            title="Automations Running" 
            value={viewState.automationsRunning} 
            style={homeScreenStyles.flexItem} 
          />
          <StatCard 
            title="Appointments Scheduled" 
            value={viewState.appointmentsScheduled} 
            style={homeScreenStyles.flexItem} 
          />
        </View>

        {/* Grid Row with Demographics, Platform, and Services */}
        <View style={homeScreenStyles.gridRow}>
          <Section title="Patient Demographics" style={[homeScreenStyles.flexItem, homeScreenStyles.gridItem]}>
            <DemographicsSection 
              ageDistribution={viewState.ageDistribution}
              genderDistribution={viewState.genderDistribution}
            />
          </Section>

          <Section title="Platform Usage" style={[homeScreenStyles.flexItem, homeScreenStyles.gridItem]}>
            <PlatformSection platformDistribution={viewState.platformDistribution} />
          </Section>

          <Section title="Services" style={[homeScreenStyles.flexItem, homeScreenStyles.gridItem]}>
            <ServicesSection serviceCategoryDistribution={viewState.serviceCategoryDistribution} />
          </Section>
        </View>

        {/* Location Distribution Section */}
        <Section title="Location Distribution" style={homeScreenStyles.wideSection}>
          <LocationSection locationDistribution={viewState.locationDistribution} />
        </Section>

        {/* Scheduling Success Rate Section */}
        <Section title="Scheduling Success Rate" style={homeScreenStyles.wideSection}>
          <ProgressBar
            label={`Success (${viewState.appointmentsScheduled || 0}/${(viewState.recentAppointments || []).length})`}
            value={viewState.schedulingSuccessRate || 0}
            color={Colors.primary}
            trackColor={Colors.error}
          />
        </Section>

        {/* Appointments Section */}
        <Section
          title="Appointments"
          style={homeScreenStyles.wideSection}
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
          <AppointmentsSection
            appointments={viewState.recentAppointments || []}
            activeTab={activeTab}
            toggleIcon={toggleIcon}
            onToggleView={toggleView}
            openMenuId={openMenuId}
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
            onMenuAction={handleMenuAction}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
