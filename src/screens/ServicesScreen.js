import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import ServicesSection from '../components/sections/ServicesSection';

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [priceRangeMenuVisible, setPriceRangeMenuVisible] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      
      try {
        // Fetch services from services table using the schema from supabase.js
        const { data, error } = await supabase
          .from('services')
          .select('service_id, service_name, service_description, service_category, service_price, currency, duration_min, active, updated_at')
          .eq('active', true)
          .order('service_name', { ascending: true });

        if (error) throw error;
        
        // Get appointment counts for each service
        const servicesWithCounts = await Promise.all(
          data.map(async (service) => {
            const { count: appointmentCount } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('service_name', service.service_name);

            return {
              ...service,
              appointment_count: appointmentCount || 0
            };
          })
        );

        console.log('Fetched services count:', servicesWithCounts.length);
        console.log('Sample service data:', servicesWithCounts[0]);
        setServices(servicesWithCounts);
      } catch (err) {
        console.error('Error fetching services:', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search query and filters
  const filteredServices = services.filter(service => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.service_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.service_description && service.service_description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = categoryFilter === 'all' || 
      service.service_category.toLowerCase() === categoryFilter.toLowerCase();

    // Price range filter
    const price = parseFloat(service.service_price) || 0;
    let matchesPriceRange = true;
    if (priceRangeFilter === 'low') {
      matchesPriceRange = price < 100;
    } else if (priceRangeFilter === 'medium') {
      matchesPriceRange = price >= 100 && price <= 500;
    } else if (priceRangeFilter === 'high') {
      matchesPriceRange = price > 500;
    }

    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  const handleRowPress = (service) => {
    if (navigation) {
      navigation.navigate('ServiceDetailsScreen', { service });
    } else {
      // Fallback for when navigation is not available
      console.log('Navigation not available, service data:', service);
    }
  };

  const handleEdit = (service) => {
    console.log('Edit service:', service);
    // TODO: Implement edit functionality
  };

  const handleDelete = (service) => {
    console.log('Delete service:', service);
    // TODO: Implement delete functionality
  };

  const handleAddNew = () => {
    if (navigation) {
      navigation.navigate('AddServiceScreen');
    } else {
      console.log('Navigation not available');
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
        <TouchableOpacity>
          <Text style={styles.breadcrumbText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Services</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Service Management</Text>
      <Text style={styles.subheader}>View and Manage Available Services</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, categories, or descriptions..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters Row */}
      <View style={styles.filtersContainer}>
        {/* Left Side - Filters */}
        <View style={styles.filtersLeft}>
          {/* Category Filter */}
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
                  {categoryFilter === 'all' ? 'Category' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setCategoryFilter('all'); setCategoryMenuVisible(false); }} title="All Categories" />
              <Menu.Item onPress={() => { setCategoryFilter('general'); setCategoryMenuVisible(false); }} title="General" />
              <Menu.Item onPress={() => { setCategoryFilter('cosmetic'); setCategoryMenuVisible(false); }} title="Cosmetic" />
              <Menu.Item onPress={() => { setCategoryFilter('orthodontic'); setCategoryMenuVisible(false); }} title="Orthodontic" />
              <Menu.Item onPress={() => { setCategoryFilter('surgical'); setCategoryMenuVisible(false); }} title="Surgical" />
            </Menu>
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <Menu
              visible={priceRangeMenuVisible}
              onDismiss={() => setPriceRangeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setPriceRangeMenuVisible(true)}
                  style={styles.filterButton}
                  labelStyle={styles.filterButtonText}
                  icon="chevron-down"
                >
                {priceRangeFilter === 'all' ? 'Price Range' : 
                 priceRangeFilter === 'low' ? 'Under 100' :
                 priceRangeFilter === 'medium' ? '100 - 500' :
                 priceRangeFilter === 'high' ? 'Over 500' : 'All Prices'}
                </Button>
              }
            >
            <Menu.Item onPress={() => { setPriceRangeFilter('all'); setPriceRangeMenuVisible(false); }} title="All Prices" />
            <Menu.Item onPress={() => { setPriceRangeFilter('low'); setPriceRangeMenuVisible(false); }} title="Under 100" />
            <Menu.Item onPress={() => { setPriceRangeFilter('medium'); setPriceRangeMenuVisible(false); }} title="100 - 500" />
            <Menu.Item onPress={() => { setPriceRangeFilter('high'); setPriceRangeMenuVisible(false); }} title="Over 500" />
            </Menu>
          </View>
        </View>

        {/* Right Side - Add New Service Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color={Colors.background} />
            <Text style={styles.addButtonText}>Add New Service</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <ServicesSection 
          services={filteredServices} 
          onRowPress={handleRowPress}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
    minWidth: 150,
    flex: 0,
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
    marginTop: 20, // Align with filter buttons
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

export default ServicesScreen;
