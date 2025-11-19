import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Section from '../components/Section';
import StatCard from '../components/StatCard';
import DemographicsSection from '../components/sections/DemographicsSection';
import PlatformSection from '../components/sections/PlatformSection';
import ServiceCategorySection from '../components/sections/ServiceCategorySection';
import AppointmentsSection from '../components/sections/AppointmentsSection';
import { useHomeScreen } from '../hooks/useHomeScreen';
import { getTopService, getTopPlatform } from '../utils/dataUtils';
import { chatService } from '../services/chatService';
import { Colors } from '../constants/Colors';
import { homeScreenStyles } from '../styles/HomeScreenStyles';
import { setSupabaseCredentials } from '../config/supabase';

const TenantDashboardScreen = ({ navigation, route, business: businessProp, previousCredentials: previousCredentialsProp }) => {
  const insets = useSafeAreaInsets();
  const businessParam = route?.params?.business;
  const previousParam = route?.params?.previousCredentials;
  const business = businessProp || businessParam || {};
  const previousCredentials = previousCredentialsProp || previousParam;
  const businessTitle = business?.business_name || business?.email || '';
  const businessSlug = useMemo(() => {
    const source =
      business?.business_name ||
      business?.email ||
      business?.id ||
      business?.business_id ||
      '';
    if (!source) return '';
    return String(source)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [business]);

  const {
    viewState,
    activeTab,
    openMenuId,
    toggleView,
    toggleIcon,
    handleMenuOpen,
    handleMenuClose,
    handleMenuAction,
  } = useHomeScreen();

  const handleBackToBusinesses = async () => {
    if (previousCredentials?.url && previousCredentials?.anonKey) {
      await setSupabaseCredentials(
        {
          userId: previousCredentials.userId,
          url: previousCredentials.url,
          anonKey: previousCredentials.anonKey,
          serviceRoleKey: previousCredentials.serviceRoleKey,
        },
        { persist: false }
      );
    }
    navigation?.navigate?.('SuperuserDashboard');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top || 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={handleBackToBusinesses}>
          <Ionicons name="arrow-back" size={16} color={Colors.primary} />
          <Text style={styles.backLinkText}>Back to All Businesses</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {businessTitle ? `${businessTitle} Dashboard` : 'Dashboard'}
          </Text>
          <Text style={styles.headerSubtitle}>Real-time performance overview and patient metrics.</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Patients"
            value={viewState.totalPatients}
            icon="people"
            style={styles.statCard}
          />
          <StatCard
            title="Confirmed Appointments"
            value={viewState.appointmentsScheduled}
            icon="checkmark-done"
            style={styles.statCard}
          />
          <StatCard
            title="Top Platform"
            value={getTopPlatform(viewState.platformDistribution)}
            icon="phone-portrait"
            style={styles.statCard}
          />
          <StatCard
            title="Top Service"
            value={getTopService(viewState.serviceCategoryDistribution)}
            icon="medical"
            style={styles.statCard}
          />
        </View>

        <View style={styles.sectionsRow}>
          <Section title="Patient Demographics" style={[homeScreenStyles.flexItem, styles.sectionCard]}>
            <DemographicsSection
              ageDistribution={viewState.ageDistribution}
              genderDistribution={viewState.genderDistribution}
            />
          </Section>

          <Section title="Platform Usage" style={[homeScreenStyles.flexItem, styles.sectionCard]}>
            <PlatformSection platformDistribution={viewState.platformDistribution} />
          </Section>

          <Section title="Top Requested Services" style={[homeScreenStyles.flexItem, styles.sectionCard]}>
            <ServiceCategorySection serviceCategoryDistribution={viewState.serviceCategoryDistribution} />
          </Section>
        </View>

        <Section
          title="Appointments"
          style={[homeScreenStyles.wideSection, styles.sectionCard]}
          right={
            <TouchableOpacity onPress={toggleView} accessibilityLabel="Toggle view">
              <Ionicons name={toggleIcon} size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
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
            onRowPress={async (appointment) => {
              if (!navigation) return;
              try {
                const businessId = business?.id || appointment?.business_id || null;
                const chatHistory = await chatService.getChatHistory(appointment.sender_id, businessId);
                navigation.navigate('AppointmentDetailsScreen', {
                  appointment,
                  chatHistory,
                  tenantContext: { business, businessSlug },
                });
              } catch (error) {
                navigation.navigate('AppointmentDetailsScreen', {
                  appointment,
                  chatHistory: [],
                  tenantContext: { business, businessSlug },
                });
              }
            }}
          />
        </Section>
      </ScrollView>
    </View>
  );
};

export default TenantDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    marginTop: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    marginTop: 6,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLinkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
  },
  sectionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
});

