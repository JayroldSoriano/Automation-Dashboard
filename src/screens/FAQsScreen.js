import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import FAQsSection from '../components/sections/FAQsSection';

const FAQsScreen = ({ navigation }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('faq_id, question, answer, category, updated_at')
        .order('question', { ascending: true });

      if (error) throw error;

      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = faqs
      .map((faq) => (faq.category || '').trim())
      .filter((category) => category.length > 0);
    return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesSearch =
        query.length === 0 ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        (faq.category && faq.category.toLowerCase().includes(query));

      const matchesCategory = categoryFilter === 'all' || (faq.category || '').toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, categoryFilter]);

  const handleAddFAQ = () => {
    if (navigation?.navigate) {
      navigation.navigate('AddFAQScreen');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => navigation?.navigate && navigation.navigate('Dashboard')}>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>FAQs</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>FAQ Management</Text>
      <Text style={styles.subheader}>View, search, and manage common questions.</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions, answers, or categories..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters and actions */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersLeft}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Category</Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setCategoryMenuVisible(true)}
                  style={styles.filterButton}
                  labelStyle={styles.filterButtonText}
                  icon="chevron-down"
                >
                  {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setCategoryFilter('all');
                  setCategoryMenuVisible(false);
                }}
                title="All Categories"
              />
              {availableCategories.map((category) => (
                <Menu.Item
                  key={category}
                  onPress={() => {
                    setCategoryFilter(category);
                    setCategoryMenuVisible(false);
                  }}
                  title={category}
                />
              ))}
              {availableCategories.length === 0 && (
                <Menu.Item title="No categories found" disabled />
              )}
            </Menu>
          </View>
        </View>

        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFAQ}>
            <Ionicons name="add" size={20} color={Colors.background} />
            <Text style={styles.addButtonText}>Add FAQ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <FAQsSection faqs={filteredFaqs} onFAQUpdate={fetchFaqs} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Layout.spacing.md,
    lineHeight: 24,
  },
  searchContainer: {
    marginBottom: Layout.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Layout.spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: Layout.spacing.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.lg,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  filtersLeft: {
    flexDirection: 'row',
    gap: Layout.spacing.lg,
    flex: 1,
  },
  filterItem: {
    minWidth: 180,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  filterButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  addButtonContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  tableWrapper: {
    flex: 1,
    width: '100%',
  },
});

export default FAQsScreen;


