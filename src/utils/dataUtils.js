import { HOME_SCREEN_CONSTANTS, DEFAULT_DISTRIBUTIONS } from '../constants/HomeScreen';

/**
 * Processes age distribution data for display
 * @param {Object} ageDistribution - Raw age distribution data
 * @returns {Object} Processed age data with labels and values
 */
export const processAgeDistribution = (ageDistribution = DEFAULT_DISTRIBUTIONS.AGE) => {
  const ageData = HOME_SCREEN_CONSTANTS.AGE_GROUPS.map(group => ageDistribution[group] || 0);
  const totalAge = ageData.reduce((sum, val) => sum + val, 0);
  const maxAgeIndex = ageData.indexOf(Math.max(...ageData));
  
  return {
    data: ageData,
    labels: HOME_SCREEN_CONSTANTS.AGE_GROUPS,
    total: totalAge,
    maxIndex: maxAgeIndex,
    hasData: totalAge > 0
  };
};

/**
 * Processes gender distribution data for display
 * @param {Object} genderDistribution - Raw gender distribution data
 * @returns {Object} Processed gender data with labels and values
 */
export const processGenderDistribution = (genderDistribution = DEFAULT_DISTRIBUTIONS.GENDER) => {
  const genderData = HOME_SCREEN_CONSTANTS.GENDER_GROUPS.map(group => genderDistribution[group] || 0);
  const totalGender = genderData.reduce((sum, val) => sum + val, 0);
  const maxGenderIndex = genderData.indexOf(Math.max(...genderData));
  
  return {
    data: genderData,
    labels: HOME_SCREEN_CONSTANTS.GENDER_GROUPS,
    total: totalGender,
    maxIndex: maxGenderIndex,
    hasData: totalGender > 0
  };
};

/**
 * Processes platform distribution data for display
 * @param {Object} platformDistribution - Raw platform distribution data
 * @returns {Object} Processed platform data with labels, values, and colors
 */
export const processPlatformDistribution = (platformDistribution = DEFAULT_DISTRIBUTIONS.PLATFORM) => {
  const platformEntries = Object.entries(platformDistribution);
  
  if (platformEntries.length === 0) {
    return { hasData: false };
  }
  
  const sortedPlatforms = platformEntries.sort(([,a], [,b]) => b - a);
  const platformData = sortedPlatforms.map(([, count]) => count);
  const platformLabels = sortedPlatforms.map(([name]) => name);
  const totalPlatform = platformData.reduce((sum, val) => sum + val, 0);
  
  const platformColors = HOME_SCREEN_CONSTANTS.PLATFORM_COLORS.slice(0, platformData.length);
  
  return {
    data: platformData,
    labels: platformLabels,
    colors: platformColors,
    total: totalPlatform,
    hasData: totalPlatform > 0
  };
};

/**
 * Processes service category distribution data for display
 * @param {Object} serviceCategoryDistribution - Raw service category distribution data
 * @returns {Object} Processed service category data with labels, values, and colors
 */
export const processServiceCategoryDistribution = (serviceCategoryDistribution = DEFAULT_DISTRIBUTIONS.SERVICE) => {
  const categoryEntries = Object.entries(serviceCategoryDistribution);
  
  if (categoryEntries.length === 0) {
    return { hasData: false };
  }
  
  const sortedCategories = categoryEntries.sort(([,a], [,b]) => b - a);
  const categoryData = sortedCategories.map(([, count]) => count);
  const categoryLabels = sortedCategories.map(([name]) => name);
  const totalCategories = categoryData.reduce((sum, val) => sum + val, 0);
  
  const categoryColors = categoryData.map((_, index) => 
    HOME_SCREEN_CONSTANTS.SERVICE_COLORS[index % HOME_SCREEN_CONSTANTS.SERVICE_COLORS.length]
  );
  
  const maxCategoryIndex = categoryData.indexOf(Math.max(...categoryData));
  
  return {
    data: categoryData,
    labels: categoryLabels,
    colors: categoryColors,
    total: totalCategories,
    maxIndex: maxCategoryIndex,
    hasData: totalCategories > 0
  };
};

/**
 * Processes location distribution data for display
 * @param {Object} locationDistribution - Raw location distribution data
 * @returns {Object} Processed location data with sorted entries and totals
 */
export const processLocationDistribution = (locationDistribution = DEFAULT_DISTRIBUTIONS.LOCATION) => {
  const locationEntries = Object.entries(locationDistribution);
  
  if (locationEntries.length === 0) {
    return { hasData: false };
  }
  
  const sortedLocations = locationEntries
    .sort(([,a], [,b]) => b - a)
    .slice(0, HOME_SCREEN_CONSTANTS.MAX_LOCATIONS_DISPLAY);
  
  const totalPatients = Object.values(locationDistribution).reduce((sum, count) => sum + count, 0);
  
  return {
    locations: sortedLocations,
    totalPatients,
    hasData: totalPatients > 0
  };
};

/**
 * Processes appointment data for table display
 * @param {Array} appointments - Raw appointment data
 * @param {number} limit - Maximum number of appointments to display
 * @returns {Array} Processed appointment data for table
 */
export const processAppointmentsForTable = (appointments = [], limit = HOME_SCREEN_CONSTANTS.MAX_APPOINTMENTS_TABLE) => {
  return appointments.slice(0, limit).map((appt, idx) => {
    const date = appt.scheduled_date || (appt.appointment_created_at ? appt.appointment_created_at.split('T')[0] : '');
    const time = appt.scheduled_time || '';
    const name = appt.name || '—';
    const service = appt.service_name || '—';
    const status = (appt.status || '').toLowerCase();
    const label = appt.status || '—';
    const rowKey = appt.appointment_id ?? idx;
    
    return {
      key: rowKey,
      data: [date, time, name, service, { status, label }]
    };
  });
};

/**
 * Processes appointment data for expanded card display
 * @param {Array} appointments - Raw appointment data
 * @param {number} limit - Maximum number of appointments to display
 * @returns {Array} Processed appointment data for cards
 */
export const processAppointmentsForCards = (appointments = [], limit = HOME_SCREEN_CONSTANTS.MAX_APPOINTMENTS_EXPANDED) => {
  return appointments.slice(0, limit).map((appt, idx) => {
    const date = appt.scheduled_date || (appt.appointment_created_at ? appt.appointment_created_at.split('T')[0] : '—');
    const cardId = appt.appointment_id ?? appt.id ?? idx;
    
    return {
      ...appt,
      id: cardId,
      displayDate: date,
      inquiryNumber: appt.appointment_id ?? idx + 1
    };
  });
};
