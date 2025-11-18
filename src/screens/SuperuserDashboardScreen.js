import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useResponsive } from '../utils/useResponsive';
import {
  supabase,
  onSupabaseClientChange,
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [editFormData, setEditFormData] = useState({
    business_name: '',
    email: '',
    password: '',
    subscription_tier: 'Standard',
    subscription_expiration: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const { breakpoint } = useResponsive();

  // Dropdown visibility state for edit modal
  const [tierDropdownVisible, setTierDropdownVisible] = useState(false);

  // Snackbar state for edit modal
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const snackbarAnimation = useRef(new Animated.Value(0)).current;

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
              created_at,
              updated_at
            `
          )
          .order('business_name', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        const normalized =
          data?.map((business) => ({
            ...business,
            patientsCount: null,
            confirmedBookings: null,
            metricsStatus: 'loading',
            metricsError: '',
          })) || [];

        console.log('[SuperuserDashboard] Loaded businesses', {
          total: normalized.length,
          sample: normalized.slice(0, 2).map((b) => ({
            id: b.id,
            business_name: b.business_name,
          })),
        });

        if (isMounted) {
          setBusinesses(normalized);
          setError('');
        }

        const enriched = await fetchBusinessMetrics(normalized);
        if (isMounted) {
          setBusinesses(enriched);
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

  const handleEditBusiness = (business) => {
    setSelectedBusiness(business);
    // Format subscription_expiration date if it exists
    let expirationDate = '';
    if (business.subscription_expiration) {
      const date = new Date(business.subscription_expiration);
      if (!isNaN(date.getTime())) {
        expirationDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    }
    setEditFormData({
      business_name: business.business_name || '',
      email: business.email || '',
      password: '',
      subscription_tier: business.subscription_tier || 'Standard',
      subscription_expiration: expirationDate,
    });
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedBusiness(null);
    setEditFormData({
      business_name: '',
      email: '',
      password: '',
      subscription_tier: 'Standard',
      subscription_expiration: '',
    });
    setTierDropdownVisible(false);
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchBusinessMetrics = async (businessList) => {
    const client = supabase;
    if (!client || !businessList?.length) return businessList;

    return Promise.all(
      businessList.map(async (business) => {
        try {
          const [{ count: patientsCount, error: patientsError }, { count: confirmedCount, error: confirmedError }] =
            await Promise.all([
              client.from('patients').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
              client
                .from('appointments')
                .select('id', { count: 'exact', head: true })
                .eq('business_id', business.id)
                .eq('status', 'confirmed'),
            ]);

          if (patientsError || confirmedError) {
            throw patientsError || confirmedError;
          }

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
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);

    Animated.timing(snackbarAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(hideSnackbar, 3000);
  };

  const hideSnackbar = () => {
    Animated.timing(snackbarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSnackbarVisible(false);
    });
  };

  const validateEditForm = () => {
    if (!editFormData.business_name.trim()) {
      Alert.alert('Validation Error', 'Business name is required');
      return false;
    }
    if (!editFormData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    // Password is optional for edit, but if provided, must be at least 6 characters
    if (editFormData.password && editFormData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleUpdateBusiness = async () => {
    if (!validateEditForm() || !selectedBusiness) return;

    setEditLoading(true);
    try {
      const updatePayload = {
        business_name: editFormData.business_name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        subscription_tier: editFormData.subscription_tier || 'Standard',
        subscription_expiration: editFormData.subscription_expiration.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Only update password if a new one is provided
      if (editFormData.password.trim()) {
        updatePayload.password = editFormData.password.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', selectedBusiness.id);

      if (error) throw error;

      showSnackbar('Business updated successfully!', 'success');

      // Refresh the businesses list by re-fetching
      const { data, error: fetchError } = await supabase
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
            created_at,
            updated_at
          `
        )
        .order('business_name', { ascending: true });

      if (!fetchError && data) {
        const normalized = data.map((business) => ({
          ...business,
          patientsCount: null,
          confirmedBookings: null,
          metricsStatus: 'loading',
          metricsError: '',
        }));

        setBusinesses(normalized);

        const enriched = await fetchBusinessMetrics(normalized);
        setBusinesses(enriched);
      }

      setTimeout(() => {
        handleCloseEditModal();
      }, 1500);
    } catch (err) {
      console.error('Error updating business:', err);
      showSnackbar(err.message || 'Failed to update business. Please try again.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewDashboard = (business) => {
    Alert.alert(
      'Dashboard not available',
      'Tenant dashboards are not available in this build.'
    );
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

        <TouchableOpacity 
          activeOpacity={0.85} 
          style={styles.ctaButton}
          onPress={() => navigation?.navigate && navigation.navigate('SetupNewBusinessScreen')}
        >
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
                    <View style={styles.cardIdRow}>
                      <Text style={styles.cardIdLabel}>ID</Text>
                      <Text style={styles.cardIdValue}>{business.id}</Text>
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
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.editButton}
                      onPress={() => handleEditBusiness(business)}
                    >
                      <Ionicons name="create-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.viewButton}
                      onPress={() => handleViewDashboard(business)}
                    >
                      <Text style={styles.viewButtonText}>View Dashboard</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
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

      {/* Edit Business Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Business</Text>
              <TouchableOpacity onPress={handleCloseEditModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              {/* Row 1: Business Name and Email */}
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Business Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter business name"
                    placeholderTextColor={Colors.textSecondary}
                    value={editFormData.business_name}
                    onChangeText={(value) => handleEditInputChange('business_name', value)}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Email *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="business@example.com"
                    placeholderTextColor={Colors.textSecondary}
                    value={editFormData.email}
                    onChangeText={(value) => handleEditInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Row 2: Password and Subscription Tier */}
              <View style={[styles.formRow, tierDropdownVisible && styles.formRowWithDropdown]}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Password (Leave blank to keep current)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter new password (min 6 characters)"
                    placeholderTextColor={Colors.textSecondary}
                    value={editFormData.password}
                    onChangeText={(value) => handleEditInputChange('password', value)}
                    secureTextEntry
                  />
                </View>
                <View style={[styles.formField, tierDropdownVisible && styles.formFieldWithDropdown]}>
                  <Text style={styles.fieldLabel}>Subscription Tier</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setTierDropdownVisible(!tierDropdownVisible);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownText}>{editFormData.subscription_tier || 'Select Tier'}</Text>
                    <MaterialIcons
                      name={tierDropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {tierDropdownVisible && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleEditInputChange('subscription_tier', 'Standard');
                          setTierDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>Standard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleEditInputChange('subscription_tier', 'Premium');
                          setTierDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>Premium</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleEditInputChange('subscription_tier', 'Enterprise');
                          setTierDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>Enterprise</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Row 3: Subscription Expiration */}
              <View style={styles.formRow}>
                <View style={[styles.formField, styles.fullWidthField]}>
                  <Text style={styles.fieldLabel}>Subscription Expiration (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textSecondary}
                    value={editFormData.subscription_expiration}
                    onChangeText={(value) => handleEditInputChange('subscription_expiration', value)}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCloseEditModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, editLoading && styles.submitButtonDisabled]}
                  onPress={handleUpdateBusiness}
                  disabled={editLoading}
                >
                  <Text style={styles.submitButtonText}>{editLoading ? 'Updating...' : 'Update Business'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Snackbar */}
        {snackbarVisible && (
          <Animated.View
            style={[
              styles.snackbar,
              {
                backgroundColor: snackbarType === 'success' ? '#1B5E20' : '#B71C1C',
                transform: [
                  {
                    translateY: snackbarAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.snackbarContent}>
              <MaterialIcons
                name={snackbarType === 'success' ? 'check-circle' : 'error'}
                size={20}
                color="white"
              />
              <Text style={styles.snackbarText}>{snackbarMessage}</Text>
              <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarClose}>
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Modal>
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
  cardIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardIdLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardIdValue: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 24,
    minHeight: 48,
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
  cardActions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 10,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: '100%',
    maxWidth: 900,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  // Form styles (matching SetupNewBusinessScreen)
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  formRowWithDropdown: {
    zIndex: 20,
  },
  formField: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  formFieldWithDropdown: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  fullWidthField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  // Dropdown styles
  dropdownButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  // Snackbar styles
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  snackbarText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  snackbarClose: {
    padding: 4,
  },
});


