export const HOME_SCREEN_CONSTANTS = {
  REFRESH_INTERVAL: 5000, // 5 seconds
  MAX_APPOINTMENTS_TABLE: 10,
  MAX_APPOINTMENTS_EXPANDED: 12,
  MAX_LOCATIONS_DISPLAY: 10,
  AGE_GROUPS: ['0-18', '19-35', '36-55', '56+'],
  GENDER_GROUPS: ['Male', 'Female', 'Other'],
  PLATFORM_COLORS: [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#8B5A2B', // Brown
  ],
  SERVICE_COLORS: [
    '#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', 
    '#FFC0CB', '#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', 
    '#10B981', '#6366F1'
  ],
  TABLE_COLUMNS: ['DATE', 'TIME', 'PATIENT NAME', 'SERVICE', 'STATUS'],
  MENU_ACTIONS: ['Completed', 'Reschedule', 'Cancel'],
  VIEW_MODES: {
    TABLE: 'Table',
    EXPANDED: 'Expanded'
  },
  ICONS: {
    TABLE_VIEW: 'view-grid',
    EXPANDED_VIEW: 'view-list'
  }
};

export const TIME_FORMATS = {
  HOURS_PER_DAY: 24,
  HOURS_PER_WEEK: 168,
  HOURS_PER_MONTH: 730
};

export const DEFAULT_DISTRIBUTIONS = {
  AGE: { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0 },
  GENDER: { Male: 0, Female: 0, Other: 0 },
  SERVICE: {},
  PLATFORM: {},
  LOCATION: {}
};
