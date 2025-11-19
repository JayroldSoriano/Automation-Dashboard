import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { supabase } from '../../config/supabase';

const FAQ_TABLE_COLUMNS = ['Question', 'Answer', 'Category', 'Last Updated', 'Actions'];
const CATEGORY_OPTIONS = ['General', 'Appointments', 'Billing', 'Treatment', 'Policies', 'Other'];

const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const FAQsSection = ({ faqs = [], onFAQUpdate, businessId }) => {
  // Filter FAQs by business_id if provided
  const filteredFaqs = businessId 
    ? faqs.filter(faq => faq.business_id === businessId)
    : faqs;
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [editForm, setEditForm] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const snackbarAnimation = useRef(new Animated.Value(0)).current;

  const tableRows = useMemo(
    () =>
      filteredFaqs.map((faq) => ({
        key: `faq-${faq.faq_id}`,
        faq,
        cells: [
          <Text style={styles.cellPrimary}>{faq.question}</Text>,
          <Text style={styles.cellSecondary} numberOfLines={3}>
            {faq.answer}
          </Text>,
          <Text style={styles.cellSecondary}>{faq.category || '—'}</Text>,
          <Text style={styles.cellSecondary}>{formatTimestamp(faq.updated_at)}</Text>,
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditFAQ(faq)} activeOpacity={0.7}>
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>,
        ],
      })),
    [filteredFaqs]
  );

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
    }).start(() => setSnackbarVisible(false));
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setEditForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || '',
    });
    setCategoryDropdownVisible(false);
    setEditModalVisible(true);
  };

  const handleSaveFAQ = async () => {
    if (!editingFAQ) return;

    if (!editForm.question.trim() || !editForm.answer.trim()) {
      showSnackbar('Question and answer are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload = {
        question: editForm.question.trim(),
        answer: editForm.answer.trim(),
        category: editForm.category.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let updateQuery = supabase
        .from('faqs')
        .update(updatePayload)
        .eq('faq_id', editingFAQ.faq_id);
      
      // Add business_id filter for security if provided
      if (businessId) {
        updateQuery = updateQuery.eq('business_id', businessId);
      }

      const { error } = await updateQuery;

      if (error) throw error;

      showSnackbar('FAQ updated successfully', 'success');
      setEditModalVisible(false);
      if (onFAQUpdate) {
        onFAQUpdate();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showSnackbar('Failed to update FAQ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {FAQ_TABLE_COLUMNS.map((column) => (
          <View key={column} style={styles.cell}>
            <Text style={styles.headerText}>{column.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      {/* Body */}
      <ScrollView style={styles.tableBody} showsVerticalScrollIndicator>
        {tableRows.map((row) => (
          <View key={row.key} style={styles.tableRow}>
            {row.cells.map((cell, index) => (
              <View
                key={`${row.key}-cell-${index}`}
                style={[
                  styles.cell,
                  index === 0 && styles.questionCell,
                  index === 1 && styles.answerCell,
                  index === 2 && styles.categoryCell,
                  index === 3 && styles.updatedCell,
                  index === 4 && styles.actionsCell,
                ]}
              >
                {cell}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit FAQ</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Question *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.question}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, question: text }))}
                  placeholder="Question"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Answer *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.answer}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, answer: text }))}
                  placeholder="Answer"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setCategoryDropdownVisible((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{editForm.category || 'Select category (optional)'}</Text>
                  <MaterialIcons
                    name={categoryDropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {categoryDropdownVisible && (
                  <View style={styles.dropdownMenu}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setEditForm((prev) => ({ ...prev, category }));
                          setCategoryDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEditForm((prev) => ({ ...prev, category: '' }));
                        setCategoryDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Clear Category</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={handleSaveFAQ} disabled={isSaving}>
                <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <MaterialIcons name={snackbarType === 'success' ? 'check-circle' : 'error'} size={20} color="white" />
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
            <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarClose}>
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: '#121e23',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xl,
    height: 400,
    width: '100%',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#172131',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableBody: {
    backgroundColor: '#111d22',
    flex: 1,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2b3a4c',
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
  },
  cell: {
    flex: 1,
  },
  questionCell: {
    flex: 1.5,
  },
  answerCell: {
    flex: 2.5,
  },
  categoryCell: {
    flex: 1,
  },
  updatedCell: {
    flex: 1.2,
  },
  actionsCell: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  headerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  cellPrimary: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cellSecondary: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#0F1A20',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2c35',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: Layout.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  input: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 120,
  },
  dropdownButton: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  dropdownMenu: {
    backgroundColor: '#1e2c35',
    borderWidth: 1,
    borderColor: '#2b3a4c',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2b3a4c',
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.spacing.md,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e2c35',
  },
  cancelButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: 8,
    backgroundColor: '#2b3a4c',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  saveButtonText: {
    color: 'white',
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

export default FAQsSection;


