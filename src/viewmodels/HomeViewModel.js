import { supabase } from '../config/supabase'; // adjust path

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
      // Fetch from appointment_analytics (authoritative source)
      const selectColumns = 'appointment_id, patient_name, patient_gender, patient_age, service_name, status, scheduled_date, scheduled_time, platform, successful_scheduling, created_at';

      const { data, error } = await supabase
        .from('appointment_analytics')
        .select(selectColumns)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        const uniquePlatforms = new Set();
        const uniquePatientNames = new Set();
        let successfulCount = 0;

        // Distributions
        const ageBuckets = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 };
        const genderBuckets = { Male: 0, Female: 0, Other: 0 };

        data.forEach((row) => {
          if (row.platform) uniquePlatforms.add(row.platform);
          if (row.patient_name) uniquePatientNames.add(row.patient_name);
          if (row.successful_scheduling) successfulCount += 1;

          // Age bucketing (frontend handling)
          const rawAge = row.patient_age;
          let ageNumber = null;
          if (typeof rawAge === 'number') {
            ageNumber = rawAge;
          } else if (typeof rawAge === 'string') {
            const parsed = parseInt(rawAge, 10);
            if (!isNaN(parsed)) ageNumber = parsed;
          }
          if (ageNumber !== null) {
            if (ageNumber <= 18) ageBuckets['0-18'] += 1;
            else if (ageNumber <= 35) ageBuckets['19-35'] += 1;
            else if (ageNumber <= 55) ageBuckets['36-55'] += 1;
            else ageBuckets['56+'] += 1;
          }

          // Gender bucketing (normalize to Male/Female/Other)
          const rawGender = (row.patient_gender || '').toString().trim().toLowerCase();
          if (rawGender) {
            if (rawGender.startsWith('m')) genderBuckets.Male += 1;
            else if (rawGender.startsWith('f')) genderBuckets.Female += 1;
            else genderBuckets.Other += 1;
          }
        });

        const totalAppointments = data.length;
        const successRate = totalAppointments > 0 ? Math.round((successfulCount / totalAppointments) * 100) : 0;

        this.updateState({
          totalPatients: uniquePatientNames.size || data.length,
          automationsRunning: uniquePlatforms.size,
          appointmentsScheduled: successfulCount,
          recentAppointments: data,
          isLoading: false,
          lastUpdated: new Date(),
          ageDistribution: ageBuckets,
          genderDistribution: genderBuckets,
          schedulingSuccessRate: successRate,
        });
      } else {
        console.error('Database error:', error);
        this.updateState({
          totalPatients: 0,
          automationsRunning: 0,
          appointmentsScheduled: 0,
          recentAppointments: [],
          isLoading: false,
          lastUpdated: new Date(),
          ageDistribution: { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 },
          genderDistribution: { Male: 0, Female: 0, Other: 0 },
          schedulingSuccessRate: 0,
        });
      }
    } catch (err) {
      console.error('Connection error:', err);
      // Fallback to default values if connection fails
      this.updateState({
        totalPatients: 0,
        automationsRunning: 0,
        appointmentsScheduled: 0,
        recentAppointments: [],
        isLoading: false,
        lastUpdated: new Date(),
        ageDistribution: { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 },
        genderDistribution: { Male: 0, Female: 0, Other: 0 },
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
