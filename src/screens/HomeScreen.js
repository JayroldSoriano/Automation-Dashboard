import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';

// Components
import Section from '../components/Section';
import StatCard from '../components/StatCard';
import DemographicsSection from '../components/sections/DemographicsSection';
import PlatformSection from '../components/sections/PlatformSection';
import ServicesSection from '../components/sections/ServicesSection';
import AppointmentsSection from '../components/sections/AppointmentsSection';

// Hooks and Utils
import { useHomeScreen } from '../hooks/useHomeScreen';

// Constants and Styles
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

        {/* Top Statistics Row - updated */}
        <View style={homeScreenStyles.topStatsRow}>
          <StatCard 
            title="Total Patients" 
            value={viewState.totalPatients} 
            style={homeScreenStyles.flexItem} 
          />
          <StatCard 
            title="Appointments Scheduled" 
            value={viewState.appointmentsScheduled} 
            style={homeScreenStyles.flexItem} 
          />
          <StatCard 
            title="Top Service" 
            value={viewState.topService || 'Flu Vaccine'} 
            style={homeScreenStyles.flexItem} 
          />
          <StatCard 
            title="Top Platform" 
            value={viewState.topPlatform || 'Facebook'} 
            style={homeScreenStyles.flexItem} 
          />
        </View>

        {/* Three Cards Row - Demographics, Platform, and Services */}
        <View style={homeScreenStyles.threeCardsRow}>
          <Section title="Patient Demographics" style={[homeScreenStyles.flexItem, homeScreenStyles.cardItem]}>
            <DemographicsSection 
              ageDistribution={viewState.ageDistribution}
              genderDistribution={viewState.genderDistribution}
            />
          </Section>

          <Section title="Platform Usage" style={[homeScreenStyles.flexItem, homeScreenStyles.cardItem]}>
            <PlatformSection platformDistribution={viewState.platformDistribution} />
          </Section>

          <Section title="Top Requested Services" style={[homeScreenStyles.flexItem, homeScreenStyles.cardItem]}>
            <ServicesSection serviceCategoryDistribution={viewState.serviceCategoryDistribution} />
          </Section>
        </View>

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
