import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import AddServiceScreen from '../screens/AddServiceScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ReportsScreen from '../screens/ReportsScreen';
import { Colors } from '../constants/Colors';
import { useResponsive } from '../utils/useResponsive';
import { supabase } from '../config/supabase';

const AppNavigator = () => {
  const { isWeb, breakpoint, scale } = useResponsive();
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [routeProps, setRouteProps] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarAnimation = useRef(new Animated.Value(0)).current;

  // Snackbar functions
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    
    Animated.timing(snackbarAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideSnackbar();
    }, 4000);
  };

  const hideSnackbar = () => {
    Animated.timing(snackbarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSnackbarVisible(false);
    });
  };

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        if (error) throw error;
        
        setUnreadCount(count || 0);
      } catch (err) {
        console.error('Error fetching unread notifications:', err);
      }
    };

    // Fetch initial count
    fetchUnreadCount();

    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // Show snackbar for new notifications
          const newNotification = payload.new;
          const message = newNotification.message || 'New notification received';
          showSnackbar(message);
          
          // Update unread count
          fetchUnreadCount();
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        () => {
          // Update unread count when notifications are marked as read
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Fetch count periodically (every 30 seconds)
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Reset unread count when navigating to Notifications screen
  useEffect(() => {
    if (activeRoute === 'Notifications') {
      setUnreadCount(0);
    }
  }, [activeRoute]);

  const routes = useMemo(
    () => [
      { key: 'Dashboard', component: HomeScreen },
      { key: 'Appointment', component: AppointmentScreen },
      { key: 'Services', component: ServicesScreen },
      { key: 'Notifications', component: NotificationScreen },
      { key: 'Reports', component: ReportsScreen },
      { key: 'Settings', component: SettingsScreen },
      { key: 'AppointmentDetailsScreen', component: AppointmentDetailsScreen },
      { key: 'AddServiceScreen', component: AddServiceScreen },
    ],
    []
  );

  // Main navigation menu items (excludes detail/add screens)
  const mainMenuItems = useMemo(
    () => [
      { key: 'Dashboard', component: HomeScreen },
      { key: 'Appointment', component: AppointmentScreen },
      { key: 'Services', component: ServicesScreen },
      { key: 'Reports', component: ReportsScreen },
      { key: 'Settings', component: SettingsScreen },
    ],
    []
  );

  // Navigation function to handle route changes with props
  const navigate = (routeName, props = {}) => {
    setActiveRoute(routeName);
    setRouteProps((prev) => ({
      ...prev,
      [routeName]: props,
    }));
  };
  

  const headerHeight = isWeb ? (breakpoint === 'xl' || breakpoint === 'lg' ? 80 : 64) : 56;
  const logoSize = isWeb ? (breakpoint === 'xl' || breakpoint === 'lg' ? 28 : 24) : 22;
  const avatarSize = isWeb ? (breakpoint === 'xl' || breakpoint === 'lg' ? 40 : 34) : 32;

  const TopHeader = (props) => {
    return (
      <View style={[styles.headerContainer, { height: headerHeight }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={logoSize} color={Colors.primary} />
          <Text style={[styles.brandText, { fontSize: 16 * (isWeb ? scale : 1) }]}>Dental Analytics</Text>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.linksRow}>
            {mainMenuItems.map((route) => {
              const isActive = activeRoute === route.key;
              return (
                <Pressable key={route.key} onPress={() => setActiveRoute(route.key)} style={styles.linkItem}>
                  <Text
                    style={[
                      styles.linkLabel,
                      { fontSize: 12 * (isWeb ? scale : 1), color: isActive ? Colors.primary : Colors.textSecondary },
                    ]}
                  >
                    {route.key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setActiveRoute('Notifications')}
            activeOpacity={0.7}
          >
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications" size={24} color={Colors.textSecondary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <TopHeader />
      <View style={styles.contentContainer}>
        {routes.map((route) => {
          if (route.key !== activeRoute) return null;
          const Component = route.component;
          const props = routeProps[route.key] || {};
          return <Component key={route.key} navigation={{ navigate }} {...props} />;
        })}
      </View>

      {/* Snackbar for new notifications */}
      {snackbarVisible && (
        <Animated.View 
          style={[
            styles.snackbar,
            {
              transform: [{
                translateY: snackbarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.snackbarContent}>
            <Ionicons 
              name="notifications" 
              size={20} 
              color="white" 
            />
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
            <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarClose}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    color: Colors.text,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  linkItem: {
    paddingVertical: 8,
  },
  linkLabel: {
    fontWeight: '600',
    textTransform: 'none',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatar: {
    backgroundColor: Colors.secondary,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  snackbarText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  snackbarClose: {
    padding: 4,
  },
});
