import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const DEFAULT_CATEGORY = 'General';

const AddFAQScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: DEFAULT_CATEGORY,
  });
  const [loading, setLoading] = useState(false);

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
    if (!formData.question.trim()) {
      Alert.alert('Validation Error', 'Question is required');
      return false;
    }
    if (!formData.answer.trim()) {
      Alert.alert('Validation Error', 'Answer is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { count, error: countError } = await supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const nextFaqId = (count || 0) + 1;

      const insertPayload = {
        faq_id: nextFaqId,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('faqs').insert([insertPayload]);

      if (error) throw error;

      showSnackbar('FAQ added successfully!', 'success');

      setFormData({
        question: '',
        answer: '',
        category: DEFAULT_CATEGORY,
      });

      setTimeout(() => {
        if (navigation?.goBack) {
          navigation.goBack();
        }
      }, 1500);
    } catch (err) {
      console.error('Error adding FAQ:', err);
      showSnackbar('Failed to add FAQ. Please try again.', 'error');
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
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('Dashboard')}>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('FAQs')}>
          <Text style={styles.breadcrumbText}>FAQs</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Add FAQ</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Add Frequently Asked Question</Text>
      <Text style={styles.subheader}>Provide the question, answer, and optional category.</Text>

      {/* Form */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          {/* Question */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Question *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter the question"
              placeholderTextColor={Colors.textSecondary}
              value={formData.question}
              onChangeText={(value) => handleInputChange('question', value)}
            />
          </View>

          {/* Answer */}
          <View style={[styles.formField, styles.fullWidthField]}>
            <Text style={styles.fieldLabel}>Answer *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Provide the answer"
              placeholderTextColor={Colors.textSecondary}
              value={formData.answer}
              onChangeText={(value) => handleInputChange('answer', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., General, Billing, Appointments"
              placeholderTextColor={Colors.textSecondary}
              value={formData.category}
              onChangeText={(value) => handleInputChange('category', value)}
            />
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
              <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Add FAQ'}</Text>
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
  formField: {
    marginBottom: Layout.spacing.lg,
  },
  fullWidthField: {
    width: '100%',
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
    minHeight: 120,
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
});

export default AddFAQScreen;


