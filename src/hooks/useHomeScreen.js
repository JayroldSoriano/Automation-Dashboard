import { useState, useEffect, useRef } from 'react';
import { HomeViewModel } from '../viewmodels/HomeViewModel';
import { HOME_SCREEN_CONSTANTS } from '../constants/HomeScreen';

/**
 * Custom hook for HomeScreen logic and state management
 * @returns {Object} HomeScreen state and handlers
 */
export const useHomeScreen = () => {
  const [viewState, setViewState] = useState({
    inquiries: 0,
    errors: 0,
    isLoading: false,
    lastUpdated: null
  });

  const [activeTab, setActiveTab] = useState(HOME_SCREEN_CONSTANTS.VIEW_MODES.TABLE);
  const [openMenuId, setOpenMenuId] = useState(null);

  const viewModelRef = useRef(null);

  useEffect(() => {
    // Initialize ViewModel
    viewModelRef.current = new HomeViewModel();

    // Add listener for state changes
    const handleStateChange = (newState) => {
      setViewState(newState);
    };

    viewModelRef.current.addListener(handleStateChange);

    // Load initial data
    viewModelRef.current.loadDashboardData();

    // Poll every 5 seconds to refresh data
    const intervalId = setInterval(() => {
      if (viewModelRef.current) {
        viewModelRef.current.refreshData();
      }
    }, HOME_SCREEN_CONSTANTS.REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (viewModelRef.current) {
        viewModelRef.current.destroy();
      }
      clearInterval(intervalId);
    };
  }, []);

  const toggleView = () => {
    setActiveTab(prev => 
      prev === HOME_SCREEN_CONSTANTS.VIEW_MODES.TABLE 
        ? HOME_SCREEN_CONSTANTS.VIEW_MODES.EXPANDED 
        : HOME_SCREEN_CONSTANTS.VIEW_MODES.TABLE
    );
  };

  const toggleIcon = activeTab === HOME_SCREEN_CONSTANTS.VIEW_MODES.TABLE 
    ? HOME_SCREEN_CONSTANTS.ICONS.TABLE_VIEW 
    : HOME_SCREEN_CONSTANTS.ICONS.EXPANDED_VIEW;

  const handleMenuOpen = (cardId) => {
    setOpenMenuId(cardId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  const handleMenuAction = (action) => {
    // Handle menu action logic here
    console.log('Menu action:', action);
    setOpenMenuId(null);
  };

  return {
    viewState,
    activeTab,
    openMenuId,
    toggleView,
    toggleIcon,
    handleMenuOpen,
    handleMenuClose,
    handleMenuAction
  };
};
