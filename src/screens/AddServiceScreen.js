import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const AddServiceScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    service_name: '',
    service_category: '',
    service_description: '',
    service_price: '',
    currency: 'PHP',
    duration_min: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const snackbarAnimation = new Animated.Value(0);

  // Snackbar functions
  const showSnackbar = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
    
    Animated.timing(snackbarAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideSnackbar();
    }, 3000);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.service_name.trim()) {
      Alert.alert('Validation Error', 'Service name is required');
      return false;
    }
    if (!formData.service_category.trim()) {
      Alert.alert('Validation Error', 'Service category is required');
      return false;
    }
    if (!formData.service_description.trim()) {
      Alert.alert('Validation Error', 'Service description is required');
      return false;
    }
    if (!formData.service_price.trim() || isNaN(parseFloat(formData.service_price))) {
      Alert.alert('Validation Error', 'Valid service price is required');
      return false;
    }
    if (!formData.duration_min.trim() || isNaN(parseInt(formData.duration_min))) {
      Alert.alert('Validation Error', 'Valid duration in minutes is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          service_id: `SVC-${Date.now()}`, // Generate unique service ID
          service_name: formData.service_name.trim(),
          service_category: formData.service_category.trim(),
          service_description: formData.service_description.trim(),
          service_price: parseFloat(formData.service_price),
          currency: formData.currency,
          duration_min: parseInt(formData.duration_min),
          active: formData.active,
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      showSnackbar('Service added successfully!', 'success');
      
      // Reset form
      setFormData({
        service_name: '',
        service_category: '',
        service_description: '',
        service_price: '',
        currency: 'PHP',
        duration_min: '',
        active: true,
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      console.error('Error adding service:', err);
      showSnackbar('Failed to add service. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.breadcrumbText}>Services</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Add New Service</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Add New Service</Text>
      <Text style={styles.subheader}>Fill in the details of the service you want to add</Text>

      {/* Form */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
        {/* Row 1: Service Name and Category */}
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Service Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter service name"
              placeholderTextColor={Colors.textSecondary}
              value={formData.service_name}
              onChangeText={(value) => handleInputChange('service_name', value)}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Service Category *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., General, Cosmetic"
              placeholderTextColor={Colors.textSecondary}
              value={formData.service_category}
              onChangeText={(value) => handleInputChange('service_category', value)}
            />
          </View>
        </View>

        {/* Row 2: Service Description (Full Width) */}
        <View style={styles.formRow}>
          <View style={[styles.formField, styles.fullWidthField]}>
            <Text style={styles.fieldLabel}>Service Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter detailed service description"
              placeholderTextColor={Colors.textSecondary}
              value={formData.service_description}
              onChangeText={(value) => handleInputChange('service_description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Row 3: Price, Currency, Duration */}
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Price *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              value={formData.service_price}
              onChangeText={(value) => handleInputChange('service_price', value)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Currency</Text>
            <TextInput
              style={styles.textInput}
              placeholder="PHP"
              placeholderTextColor={Colors.textSecondary}
              value={formData.currency}
              onChangeText={(value) => handleInputChange('currency', value)}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Duration (min) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="60"
              placeholderTextColor={Colors.textSecondary}
              value={formData.duration_min}
              onChangeText={(value) => handleInputChange('duration_min', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Row 4: Is Active Toggle */}
        <View style={styles.formRow}>
          <View style={[styles.formField, styles.fullWidthField]}>
            <Text style={styles.fieldLabel}>Is Active</Text>
            <Text style={styles.toggleDescription}>
              {formData.active ? 'Service is active and available' : 'Service is inactive and hidden'}
            </Text>
          </View>
          <View style={styles.toggleField}>
            <TouchableOpacity
              style={[styles.toggle, formData.active && styles.toggleActive]}
              onPress={() => handleInputChange('active', !formData.active)}
            >
              <View style={[styles.toggleThumb, formData.active && styles.toggleThumbActive]} />
            </TouchableOpacity>
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
            {loading ? (
              <Text style={styles.submitButtonText}>Adding...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Add Service</Text>
            )}
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
              transform: [{
                translateY: snackbarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              }]
            }
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
  formField: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  fullWidthField: {
    flex: 1,
  },
  toggleField: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 20,
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
  toggleDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Layout.spacing.xs,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.background,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
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

export default AddServiceScreen;
