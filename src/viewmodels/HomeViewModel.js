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
      const selectColumns = 'appointment_id, patient_name, service_name, status, scheduled_date, scheduled_time, platform, successful_scheduling, created_at';

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

        data.forEach((row) => {
          if (row.platform) uniquePlatforms.add(row.platform);
          if (row.patient_name) uniquePatientNames.add(row.patient_name);
          if (row.successful_scheduling) successfulCount += 1;
        });

        this.updateState({
          totalPatients: uniquePatientNames.size || data.length,
          automationsRunning: uniquePlatforms.size,
          appointmentsScheduled: successfulCount,
          recentAppointments: data,
          isLoading: false,
          lastUpdated: new Date(),
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
