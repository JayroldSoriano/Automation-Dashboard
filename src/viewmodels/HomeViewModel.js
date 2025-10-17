// HomeViewModel.ts / .js
import { supabase } from '../config/supabase';

export class HomeViewModel {
  constructor() {
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
      // Pull from the new view that denormalizes patients + appointments
      const selectColumns =
        'appointment_id, patient_id, name, gender, age, service_name, service_category, service_price, status, scheduled_date, scheduled_time, appointment_created_at';

      // Latest 50 appointments, ordered by date then time (multi-column order via chaining)
      const { data: appts, error: apptsError } = await supabase
        .from('appointment_details')
        .select(selectColumns)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false })
        .limit(50);

      if (apptsError) throw apptsError;

      // Total distinct patients (authoritative)
      const { count: patientsCount, error: patientsCountError } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true });

      if (patientsCountError) throw patientsCountError;

      // Distinct automations currently active = distinct non-null last_agent values
      const { data: agentsRows, error: agentsError } = await supabase
        .from('patients')
        .select('last_agent')
        .not('last_agent', 'is', null);

      if (agentsError) throw agentsError;

      // Get platform distribution from patients table
      const { data: platformRows, error: platformError } = await supabase
        .from('patients')
        .select('platform')
        .not('platform', 'is', null);

      if (platformError) throw platformError;

      // Get location distribution from patients table
      const { data: locationRows, error: locationError } = await supabase
        .from('patients')
        .select('location')
        .not('location', 'is', null);

      if (locationError) throw locationError;

      // Get all unique service categories from appointments table
      const { data: allServicesRows, error: allServicesError } = await supabase
        .from('appointments')
        .select('service_category')
        .not('service_category', 'is', null);

      if (allServicesError) throw allServicesError;

      // Compute metrics from latest 50
      const ageBuckets = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
      const genderBuckets = { Male: 0, Female: 0, Other: 0 };
      const serviceCategoryBuckets = {};
      const platformBuckets = {};
      const locationBuckets = {};
      let successfulCount = 0;

      for (const row of appts || []) {
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

        // Treat 'scheduled' status as a successful scheduling event
        const status = (row.status || '').toString().trim().toLowerCase();
        if (status === 'scheduled') successfulCount += 1;
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

      const totalAppointments = (appts || []).length;
      const successRate =
        totalAppointments > 0
          ? Math.round((successfulCount / totalAppointments) * 100)
          : 0;

      // Count distinct last_agent strings
      const agentSet = new Set(
        (agentsRows || [])
          .map((r) => (r.last_agent || '').toString().trim())
          .filter((v) => v.length > 0)
      );

      this.updateState({
        totalPatients:
          typeof patientsCount === 'number' ? patientsCount : 0,
        automationsRunning: agentSet.size,
        appointmentsScheduled: successfulCount,
        recentAppointments: appts || [],
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
