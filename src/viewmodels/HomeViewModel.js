import { supabase } from '../config/supabase'; // adjust path

export class HomeViewModel {
  constructor() {
    this.listeners = [];
    this.state = {
      inquiries: 0,
      errors: 0,
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
      const { data, error } = await supabase
        .from('inquiries_summary')
        .select('*')
        .single(); // only 1 row in view

      if (!error && data) {
        this.updateState({
          inquiries: data.total_inquiries,
          errors: data.total_errors,
          isLoading: false,
          lastUpdated: new Date(),
        });
      } else {
        console.error('Database error:', error);
        // Fallback to default values if database objects don't exist yet
        this.updateState({
          inquiries: 0,
          errors: 0,
          isLoading: false,
          lastUpdated: new Date(),
        });
      }
    } catch (err) {
      console.error('Connection error:', err);
      // Fallback to default values if connection fails
      this.updateState({
        inquiries: 0,
        errors: 0,
        isLoading: false,
        lastUpdated: new Date(),
      });
    }
  }

  async refreshData() {
    await this.loadDashboardData();
  }

  startRealTimeUpdates() {
    try {
      // subscribe to table changes if you want auto-update
      this.subscription = supabase
        .channel('dashboard_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inquiries' },
          () => {
            this.loadDashboardData(); // refresh when data changes
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'errors' },
          () => {
            this.loadDashboardData(); // refresh when data changes
          }
        )
        .subscribe();
    } catch (err) {
      console.error('Real-time subscription error:', err);
      // Continue without real-time updates if subscription fails
    }
  }

  destroy() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
    }
  }
}
