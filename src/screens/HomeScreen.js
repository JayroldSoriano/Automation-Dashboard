import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';

// Components
import Section from '../components/Section';
import StatCard from '../components/StatCard';
import DemographicsSection from '../components/sections/DemographicsSection';
import PlatformSection from '../components/sections/PlatformSection';
import ServiceCategorySection from '../components/sections/ServiceCategorySection';
import AppointmentsSection from '../components/sections/AppointmentsSection';

// Hooks and Utils
import { useHomeScreen } from '../hooks/useHomeScreen';
import { getTopService, getTopPlatform } from '../utils/dataUtils';
import { chatService } from '../services/chatService';

// Constants and Styles
import { Layout } from '../constants/Layout';
import { homeScreenStyles } from '../styles/HomeScreenStyles';

/**
 * HomeScreen component - Main dashboard screen displaying key metrics and data
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.currentUser - Current logged in user object with business ID
 * @returns {JSX.Element} HomeScreen component
 */
const HomeScreen = ({ navigation, currentUser }) => {
  // Extract business ID from current user (user.id is the business_id)
  const businessId = currentUser?.id || null;
  
  const {
    viewState,
    activeTab,
    openMenuId,
    toggleView,
    toggleIcon,
    handleMenuOpen,
    handleMenuClose,
    handleMenuAction
  } = useHomeScreen(businessId);

  return (
    <ScrollView style={homeScreenStyles.container} showsVerticalScrollIndicator={true}>
      {/* Breadcrumb */}
      <View style={homeScreenStyles.breadcrumbContainer}>
        <TouchableOpacity>
          <Text style={homeScreenStyles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={homeScreenStyles.breadcrumbSeparator}>›</Text>
        <Text style={homeScreenStyles.breadcrumbActive}>Dashboard</Text>
      </View>

      {/* Header */}
      <Text style={homeScreenStyles.header}>Dashboard</Text>
      <Text style={homeScreenStyles.subheader}>
        Overview of key metrics and trends in automated processes.
      </Text>

      {/* Top Statistics Row */}
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
          value={getTopService(viewState.serviceCategoryDistribution)} 
          style={homeScreenStyles.flexItem} 
        />
        <StatCard 
          title="Top Platform" 
          value={getTopPlatform(viewState.platformDistribution)} 
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
          <ServiceCategorySection serviceCategoryDistribution={viewState.serviceCategoryDistribution} />
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
          businessId={businessId}
          onRowPress={async (appointment) => {
            if (!navigation) return;
            try {
              const chatHistory = await chatService.getChatHistory(appointment.sender_id, businessId);
              navigation.navigate('AppointmentDetailsScreen', { appointment, chatHistory });
            } catch (error) {
              navigation.navigate('AppointmentDetailsScreen', { appointment, chatHistory: [] });
            }
          }}
        />
      </Section>
    </ScrollView>
  );
};

export default HomeScreen;
