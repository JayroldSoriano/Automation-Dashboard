import { TIME_FORMATS } from '../constants/HomeScreen';

/**
 * Formats time from 24-hour format to 12-hour format
 * @param {string} scheduledTime - Time in HH:MM format
 * @returns {string} Formatted time in 12-hour format
 */
export const formatTime12h = (scheduledTime) => {
  if (!scheduledTime) return '—';
  
  try {
    const [h, m] = scheduledTime.split(':');
    const hours = parseInt(h, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${m} ${period}`;
  } catch {
    return scheduledTime;
  }
};

/**
 * Calculates time passed since a given date
 * @param {string} createdAt - ISO date string
 * @returns {string} Human-readable time passed
 */
export const getTimePassed = (createdAt) => {
  if (!createdAt) return '0 hours';
  
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  
  if (hours < TIME_FORMATS.HOURS_PER_DAY) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (hours < TIME_FORMATS.HOURS_PER_WEEK) {
    const days = Math.floor(hours / TIME_FORMATS.HOURS_PER_DAY);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (hours < TIME_FORMATS.HOURS_PER_MONTH) {
    const weeks = Math.floor(hours / TIME_FORMATS.HOURS_PER_WEEK);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  } else {
    const months = Math.floor(hours / TIME_FORMATS.HOURS_PER_MONTH);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
};
