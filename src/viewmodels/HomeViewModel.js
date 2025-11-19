// HomeViewModel.ts / .js
import { supabase } from '../config/supabase';

export class HomeViewModel {
  constructor(businessId) {
    this.businessId = businessId;
    this.listeners = [];
    this.state = {
      totalPatients: 0,
      automationsRunning: 0,
      appointmentsScheduled: 0,
      recentAppointments: [],
      isLoading: false,
      lastUpdated: null,
      ageDistribution: { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 },
      genderDistribution: { Male: 0, Female: 0, Other: 0 },
      serviceCategoryDistribution: {},
      platformDistribution: {},
      locationDistribution: {},
      schedulingSuccessRate: 0,
    };
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  async loadDashboardData() {
    this.updateState({ isLoading: true });

    try {
      // Pull from the appointment_details view that denormalizes patients + appointments
      // The view includes: patient fields (id, name, age, gender, phone, email, location, sender_id, platform, isbotactive, business_id)
      // and appointment fields (id as appointment_id, service_name, service_category, service_price, scheduled_date, scheduled_time, status, iscomplete, created_at as appointment_created_at)
      const selectColumns =
        'appointment_id, patient_id, sender_id, name, email, phone, gender, age, service_name, service_category, service_price, status, scheduled_date, scheduled_time, appointment_created_at, business_id, isbotactive, location, platform';

      // Latest 50 appointments, ordered by date then time (multi-column order via chaining)
      let query = supabase
        .from('appointment_details')
        .select(selectColumns)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false })
        .limit(50);
      
      // Filter by business_id if provided
      if (this.businessId) {
        query = query.eq('business_id', this.businessId);
      }
      
      const { data: appts, error: apptsError } = await query;

      if (apptsError) throw apptsError;

      // isbotactive is now included directly in the appointment_details view, so no need to fetch separately
      // Use isbotactive from the view, defaulting to true if not found
      const appointmentsWithBotStatus = appts.map(apt => ({
        ...apt,
        isbotactive: apt.isbotactive !== false // Default to true if not found or null
      }));

      // Total distinct patients (authoritative)
      let patientsCountQuery = supabase
        .from('patients')
        .select('id', { count: 'exact', head: true });
      
      // Filter by business_id if provided
      if (this.businessId) {
        patientsCountQuery = patientsCountQuery.eq('business_id', this.businessId);
      }
      
      const { count: patientsCount, error: patientsCountError } = await patientsCountQuery;

      if (patientsCountError) throw patientsCountError;

      // Get platform distribution from patients table
      let platformQuery = supabase
        .from('patients')
        .select('platform')
        .not('platform', 'is', null);
      
      // Filter by business_id if provided
      if (this.businessId) {
        platformQuery = platformQuery.eq('business_id', this.businessId);
      }
      
      const { data: platformRows, error: platformError } = await platformQuery;

      if (platformError) throw platformError;

      // Get location distribution from patients table
      let locationQuery = supabase
        .from('patients')
        .select('location')
        .not('location', 'is', null);
      
      // Filter by business_id if provided
      if (this.businessId) {
        locationQuery = locationQuery.eq('business_id', this.businessId);
      }
      
      const { data: locationRows, error: locationError } = await locationQuery;

      if (locationError) throw locationError;

      // Get all unique service categories from appointments table
      let servicesQuery = supabase
        .from('appointments')
        .select('service_category')
        .not('service_category', 'is', null);
      
      // Filter by business_id if provided
      if (this.businessId) {
        servicesQuery = servicesQuery.eq('business_id', this.businessId);
      }
      
      const { data: allServicesRows, error: allServicesError } = await servicesQuery;

      if (allServicesError) throw allServicesError;

      // Compute metrics from latest 50
      const ageBuckets = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
      const genderBuckets = { Male: 0, Female: 0, Other: 0 };
      const serviceCategoryBuckets = {};
      const platformBuckets = {};
      const locationBuckets = {};
      let successfulCount = 0;

      for (const row of appointmentsWithBotStatus || []) {
        // Age buckets
        const rawAge = row.age;
        let ageNum =
          typeof rawAge === 'number' ? rawAge : parseInt(rawAge, 10);
        if (!Number.isNaN(ageNum) && ageNum !== null) {
          if (ageNum <= 18) ageBuckets['0-18'] += 1;
          else if (ageNum <= 35) ageBuckets['19-35'] += 1;
          else if (ageNum <= 55) ageBuckets['36-55'] += 1;
          else ageBuckets['56+'] += 1;
        }

        // Gender buckets
        const g = (row.gender || '').toString().trim().toLowerCase();
        if (g) {
          if (g.startsWith('m')) genderBuckets.Male += 1;
          else if (g.startsWith('f')) genderBuckets.Female += 1;
          else genderBuckets.Other += 1;
        }

        // Service category buckets are calculated separately below from all services

        // Platform buckets are calculated separately below

        // Treat 'confirmed' status as a successful scheduling event
        const status = (row.status || '').toString().trim().toLowerCase();
        if (status === 'confirmed') successfulCount += 1;
      }

      // Calculate platform distribution from patients table
      for (const row of platformRows || []) {
        const platform = (row.platform || '').toString().trim();
        if (platform) {
          platformBuckets[platform] = (platformBuckets[platform] || 0) + 1;
        }
      }

      // Calculate location distribution from patients table
      for (const row of locationRows || []) {
        const location = (row.location || '').toString().trim();
        if (location) {
          locationBuckets[location] = (locationBuckets[location] || 0) + 1;
        }
      }

      // Calculate service category distribution from all appointments
      for (const row of allServicesRows || []) {
        const category = (row.service_category || '').toString().trim();
        if (category) {
          serviceCategoryBuckets[category] = (serviceCategoryBuckets[category] || 0) + 1;
        }
      }

      const totalAppointments = (appointmentsWithBotStatus || []).length;
      const successRate =
        totalAppointments > 0
          ? Math.round((successfulCount / totalAppointments) * 100)
          : 0;


      this.updateState({
        totalPatients:
          typeof patientsCount === 'number' ? patientsCount : 0,
        appointmentsScheduled: successfulCount,
        recentAppointments: appointmentsWithBotStatus || [],
        isLoading: false,
        lastUpdated: new Date(),
        ageDistribution: ageBuckets,
        genderDistribution: genderBuckets,
        serviceCategoryDistribution: serviceCategoryBuckets,
        platformDistribution: platformBuckets,
        locationDistribution: locationBuckets,
        schedulingSuccessRate: successRate,
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      this.updateState({
        totalPatients: 0,
        automationsRunning: 0,
        appointmentsScheduled: 0,
        recentAppointments: [],
        isLoading: false,
        lastUpdated: new Date(),
        ageDistribution: { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 },
        genderDistribution: { Male: 0, Female: 0, Other: 0 },
        serviceCategoryDistribution: {},
        platformDistribution: {},
        locationDistribution: {},
        schedulingSuccessRate: 0,
      });
    }
  }

  async refreshData() {
    await this.loadDashboardData();
  }

  destroy() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
    }
  }
}
