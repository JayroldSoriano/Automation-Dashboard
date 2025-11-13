import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { Colors } from '../constants/Colors';
import { useResponsive } from '../utils/useResponsive';
import {
  supabase,
  onSupabaseClientChange,
  getActiveSupabaseCredentials,
  setSupabaseCredentials,
} from '../config/supabase';

const statusThemes = {
  active: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    textColor: '#5eead4',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  pending: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    textColor: '#facc15',
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  inactive: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    textColor: '#f87171',
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  default: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    textColor: '#cbd5f5',
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
};

const SuperuserDashboardScreen = ({ navigation }) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { breakpoint } = useResponsive();

  const cardSizing = useMemo(() => {
    switch (breakpoint) {
      case 'xl':
      case 'lg':
        return { flexBasis: '23%', maxWidth: '23%' };
      case 'md':
        return { flexBasis: '31%', maxWidth: '31%' };
      case 'sm':
        return { flexBasis: '48%', maxWidth: '48%' };
      default:
        return { flexBasis: '100%', maxWidth: '100%' };
    }
  }, [breakpoint]);

  useEffect(() => {
    let isMounted = true;

    const fetchBusinesses = async () => {
      const client = supabase;
      if (!client) {
        if (isMounted) {
          setError('Supabase client is not initialized yet. Please try again shortly.');
          setLoading(false);
        }
        return;
      }

      if (isMounted) setLoading(true);
      try {
        const { data, error: fetchError } = await client
          .from('users')
          .select(
            `
              id,
              business_name,
              email,
              role,
              status,
              subscription_tier,
              subscription_expiration,
              url,
              anon_key,
              service_role_key,
              created_at,
              updated_at
            `
          )
          .order('business_name', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        let normalized =
          data?.map((business) => ({
            ...business,
            patientsCount: null,
            confirmedBookings: null,
            metricsStatus: business?.url && business?.anon_key ? 'loading' : 'missing',
            metricsError: '',
          })) || [];

        console.log('[SuperuserDashboard] Loaded businesses', {
          total: normalized.length,
          sample: normalized.slice(0, 2).map((b) => ({
            id: b.id,
            business_name: b.business_name,
            hasCredentials: !!(b.url && b.anon_key),
          })),
        });

        if (isMounted) {
          setBusinesses(normalized);
          setError('');
        }

        normalized = await Promise.all(
          normalized.map(async (business) => {
            if (business.metricsStatus !== 'loading') {
              return business;
            }

            try {
              const tenantClient = createClient(business.url, business.anon_key, {
                auth: {
                  persistSession: false,
                  autoRefreshToken: false,
                },
              });

              const [
                { count: patientsCount, error: patientsError },
                { count: confirmedCount, error: confirmedError },
              ] = await Promise.all([
                tenantClient.from('patients').select('id', { count: 'exact', head: true }),
                tenantClient
                  .from('appointments')
                  .select('id', { count: 'exact', head: true })
                  .eq('status', 'confirmed'),
              ]);

              if (patientsError || confirmedError) {
                throw patientsError || confirmedError;
              }

              console.log('[SuperuserDashboard] Metrics fetched', {
                businessId: business.id,
                patientsCount,
                confirmedCount,
              });

              return {
                ...business,
                patientsCount: typeof patientsCount === 'number' ? patientsCount : 0,
                confirmedBookings: typeof confirmedCount === 'number' ? confirmedCount : 0,
                metricsStatus: 'ready',
              };
            } catch (metricsErr) {
              console.error('[SuperuserDashboard] Failed to fetch metrics', metricsErr);
              return {
                ...business,
                metricsStatus: 'error',
                metricsError: 'Unable to load metrics for this business.',
              };
            }
          })
        );

        if (isMounted) {
          setBusinesses(normalized);
        }
      } catch (fetchErr) {
        console.error('[SuperuserDashboard] Failed to fetch businesses', fetchErr);
        if (isMounted) {
          setBusinesses([]);
          setError('Failed to load businesses. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBusinesses();
    const unsubscribe = onSupabaseClientChange(() => {
      fetchBusinesses();
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const toTitleCase = (value) =>
    (value || '')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatStatusTheme = (status) => statusThemes[(status || '').toLowerCase()] || statusThemes.default;
  const formatStatusLabel = (status) => toTitleCase(status) || 'Unknown';
  const formatDate = (value) => {
    if (!value) return 'No expiration';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'No expiration';
    return parsed.toLocaleDateString();
  };
  const formatNumber = (value) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—';

  const getBusinessSlug = (biz) => {
    if (!biz) return '';
    const source =
      biz.business_name ||
      biz.email ||
      biz.id ||
      biz.business_id ||
      '';
    if (!source) return '';
    return String(source)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleViewDashboard = async (business) => {
    if (!business?.url || !business?.anon_key) {
      Alert.alert(
        'Missing credentials',
        'This business does not have Supabase credentials configured yet.'
      );
      return;
    }

    try {
      const previousCredentials = getActiveSupabaseCredentials();
      const businessPayload = {
        id: business.id,
        business_name: business.business_name,
        email: business.email,
        url: business.url,
        anon_key: business.anon_key,
        service_role_key: business.service_role_key,
      };
      await setSupabaseCredentials(
        {
          userId: businessPayload.id,
          url: businessPayload.url,
          anonKey: businessPayload.anon_key,
          serviceRoleKey: businessPayload.service_role_key,
        },
        { persist: false }
      );

      navigation?.navigate?.('TenantDashboard', {
        business: businessPayload,
        businessSlug: getBusinessSlug(businessPayload),
        previousCredentials,
      });
    } catch (err) {
      console.error('[SuperuserDashboard] Failed to open tenant dashboard', err);
      Alert.alert(
        'Unable to open dashboard',
        'Something went wrong while loading this tenant. Please try again.'
      );
    }
  };

  const filteredBusinesses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return businesses;
    return businesses.filter((business) => {
      const name = business.business_name || '';
      const email = business.email || '';
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    });
  }, [businesses, searchQuery]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>All Businesses</Text>
          <Text style={styles.subtitle}>
            Select a business to view its detailed analytics dashboard.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.ctaButton}>
          <Ionicons name="business-outline" size={18} color="#fff" />
          <Text style={styles.ctaButtonText}>Setup New Business</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by business name or location..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!!error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.grid}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {filteredBusinesses.map((business) => {
              const statusTheme = formatStatusTheme(business.status);
              return (
                <View key={business.id} style={[styles.card, cardSizing]}>
                  <View>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{business.business_name || business.email}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusTheme.backgroundColor,
                            borderColor: statusTheme.borderColor,
                          },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusTheme.textColor }]}>
                          {formatStatusLabel(business.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.emailRow}>
                      <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.emailText}>{business.email}</Text>
                    </View>

                    <View style={styles.metrics}>
                      {business.metricsStatus === 'loading' ? (
                        <View style={styles.metricsLoadingRow}>
                          <ActivityIndicator size="small" color={Colors.primary} />
                          <Text style={styles.metricsLoadingText}>Fetching metrics…</Text>
                        </View>
                      ) : (
                        <>
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Total Patients</Text>
                            <Text style={styles.metricValue}>{formatNumber(business.patientsCount)}</Text>
                          </View>
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Confirmed Bookings</Text>
                            <Text style={styles.metricValue}>{formatNumber(business.confirmedBookings)}</Text>
                          </View>
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Subscription Tier</Text>
                            <Text style={styles.metricValue}>{toTitleCase(business.subscription_tier)}</Text>
                          </View>
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Expires On</Text>
                            <Text style={styles.metricValue}>{formatDate(business.subscription_expiration)}</Text>
                          </View>
                        </>
                      )}

                      {business.metricsStatus === 'error' && (
                        <Text style={styles.metricErrorText}>{business.metricsError}</Text>
                      )}
                      {business.metricsStatus === 'missing' && (
                        <Text style={styles.metricMutedText}>Supabase credentials missing for this business.</Text>
                      )}
                    </View>
                  </View>

                   <TouchableOpacity
                     activeOpacity={0.85}
                     style={[
                       styles.viewButton,
                       (!business.url || !business.anon_key) && styles.viewButtonDisabled,
                     ]}
                     onPress={() => handleViewDashboard(business)}
                     disabled={!business.url || !business.anon_key}
                   >
                    <Text style={styles.viewButtonText}>View Dashboard</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}

            {!filteredBusinesses.length && (
              <View style={styles.emptyState}>
                <Ionicons name="sad-outline" size={24} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  No businesses match your search. Try adjusting your filters.
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {!!filteredBusinesses.length && !loading && (
        <View style={styles.pagination}>
          <TouchableOpacity activeOpacity={0.85} style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[styles.paginationButton, styles.paginationButtonActive]}>
            <Text style={styles.paginationButtonActiveText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>3</Text>
          </TouchableOpacity>
          <Text style={styles.paginationEllipsis}>...</Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>10</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.paginationButton}>
            <Text style={styles.paginationButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default SuperuserDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 28,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    color: Colors.text,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    color: '#fecaca',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
    flexGrow: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  emailText: {
    color: Colors.textSecondary,
  },
  metrics: {
    gap: 12,
  },
  metricsLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricsLoadingText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: Colors.textSecondary,
  },
  metricValue: {
    color: Colors.text,
    fontWeight: '600',
  },
  metricErrorText: {
    marginTop: 12,
    color: '#f87171',
    fontSize: 12,
  },
  metricMutedText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  viewButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  viewButtonDisabled: {
    opacity: 0.5,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pagination: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  paginationButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  paginationButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  paginationButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paginationButtonActiveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paginationEllipsis: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});


