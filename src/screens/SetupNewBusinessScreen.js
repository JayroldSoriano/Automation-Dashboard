import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const SetupNewBusinessScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    subscription_tier: 'Standard',
    subscription_expiration: '',
  });
  const [loading, setLoading] = useState(false);
  const [createdBusinessId, setCreatedBusinessId] = useState(null);
  
  // Dropdown visibility states
  const [roleDropdownVisible, setRoleDropdownVisible] = useState(false);
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [tierDropdownVisible, setTierDropdownVisible] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const snackbarAnimation = useRef(new Animated.Value(0)).current;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to format display text (sentence case)
  const formatDisplayText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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

  const validateForm = () => {
    if (!formData.business_name.trim()) {
      Alert.alert('Validation Error', 'Business name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const insertPayload = {
        business_name: formData.business_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role || 'user',
        status: formData.status || 'active',
        subscription_tier: formData.subscription_tier || 'Standard',
        subscription_expiration: formData.subscription_expiration.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('users').insert([insertPayload]).select().single();

      if (error) throw error;

      setCreatedBusinessId(data?.id || null);
      showSnackbar('Business setup successfully!', 'success');

      setFormData({
        business_name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        subscription_tier: 'Standard',
        subscription_expiration: '',
      });

    } catch (err) {
      console.error('Error setting up business:', err);
      showSnackbar(err.message || 'Failed to setup business. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      {createdBusinessId && (
        <View style={styles.idBanner}>
          <Text style={styles.idBannerLabel}>Business ID</Text>
          <Text style={styles.idBannerValue}>{createdBusinessId}</Text>
        </View>
      )}
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('SuperuserDashboard')}>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('SuperuserDashboard')}>
          <Text style={styles.breadcrumbText}>Superuser Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Setup New Business</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Setup New Business</Text>
      <Text style={styles.subheader}>Create a new business account with Supabase credentials.</Text>

      {/* Form */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          {/* Row 1: Business Name and Email */}
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Business Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter business name"
                placeholderTextColor={Colors.textSecondary}
                value={formData.business_name}
                onChangeText={(value) => handleInputChange('business_name', value)}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="business@example.com"
                placeholderTextColor={Colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Row 2: Password and Role */}
          <View style={[styles.formRow, roleDropdownVisible && styles.formRowWithDropdown]}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Password *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor={Colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
              />
            </View>
            <View style={[styles.formField, roleDropdownVisible && styles.formFieldWithDropdown]}>
              <Text style={styles.fieldLabel}>Role</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setRoleDropdownVisible(!roleDropdownVisible);
                  setStatusDropdownVisible(false);
                  setTierDropdownVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{formatDisplayText(formData.role) || 'Select Role'}</Text>
                <MaterialIcons
                  name={roleDropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {roleDropdownVisible && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('role', 'user');
                      setRoleDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('role', 'admin');
                      setRoleDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Admin</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Row 3: Status and Subscription Tier */}
          <View
            style={[
              styles.formRow,
              (statusDropdownVisible || tierDropdownVisible) && styles.formRowWithDropdown,
            ]}
          >
            <View style={[styles.formField, statusDropdownVisible && styles.formFieldWithDropdown]}>
              <Text style={styles.fieldLabel}>Status</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setStatusDropdownVisible(!statusDropdownVisible);
                  setRoleDropdownVisible(false);
                  setTierDropdownVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{formatDisplayText(formData.status) || 'Select Status'}</Text>
                <MaterialIcons
                  name={statusDropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {statusDropdownVisible && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('status', 'active');
                      setStatusDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('status', 'inactive');
                      setStatusDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Inactive</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={[styles.formField, tierDropdownVisible && styles.formFieldWithDropdown]}>
              <Text style={styles.fieldLabel}>Subscription Tier</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setTierDropdownVisible(!tierDropdownVisible);
                  setRoleDropdownVisible(false);
                  setStatusDropdownVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{formData.subscription_tier || 'Select Tier'}</Text>
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
                      handleInputChange('subscription_tier', 'Standard');
                      setTierDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Standard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('subscription_tier', 'Premium');
                      setTierDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Premium</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('subscription_tier', 'Enterprise');
                      setTierDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Enterprise</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Row 4: Subscription Expiration */}
          <View style={styles.formRow}>
            <View style={[styles.formField, styles.fullWidthField]}>
              <Text style={styles.fieldLabel}>Subscription Expiration (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                value={formData.subscription_expiration}
                onChangeText={(value) => handleInputChange('subscription_expiration', value)}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Setting up...' : 'Setup Business'}</Text>
            </TouchableOpacity>
          </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  idBanner: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Layout.spacing.lg,
    backgroundColor: Colors.surface,
    marginBottom: Layout.spacing.lg,
  },
  idBannerLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Layout.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  idBannerValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  breadcrumbText: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  breadcrumbSeparator: {
    color: Colors.textSecondary,
    marginHorizontal: 8,
    fontSize: 16,
  },
  breadcrumbActive: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 34,
  },
  subheader: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
  },
  formWrapper: {
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.xl,
  },
  formContainer: {
    width: '50%',
    minWidth: 400,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.md,
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
    marginBottom: Layout.spacing.sm,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Layout.spacing.sm,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },
  cancelButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
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
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
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
  // Dropdown styles
  dropdownButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
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
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
});

export default SetupNewBusinessScreen;

