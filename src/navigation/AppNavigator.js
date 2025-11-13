import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SuperuserDashboardScreen from '../screens/SuperuserDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import AddServiceScreen from '../screens/AddServiceScreen';
import FAQsScreen from '../screens/FAQsScreen';
import AddFAQScreen from '../screens/AddFAQScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ReportsScreen from '../screens/ReportsScreen';
import { Colors } from '../constants/Colors';
import { useResponsive } from '../utils/useResponsive';
import {
  supabase,
  loadStoredSupabaseCredentials,
  clearSupabaseCredentials,
  resetSupabaseClient,
  onSupabaseClientChange,
} from '../config/supabase';

const AppNavigator = () => {
  const { isWeb, breakpoint, scale } = useResponsive();
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [routeProps, setRouteProps] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarAnimation = useRef(new Animated.Value(0)).current;
  const [currentUser, setCurrentUser] = useState(null);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [supabaseVersion, setSupabaseVersion] = useState(0);

  // Route <-> Path mapping for web URLs
  const routeToPath = useMemo(
    () => ({
      Dashboard: '/home/dashboard',
      SuperuserDashboard: '/home/dashboard/superuser',
      Login: '/home/dashboard/login',
      Appointment: '/home/dashboard/appointments',
      Services: '/home/dashboard/services',
      FAQs: '/home/dashboard/faqs',
      Notifications: '/home/dashboard/notifications',
      Reports: '/home/dashboard/reports',
      Settings: '/home/dashboard/settings',
      AddServiceScreen: '/home/dashboard/services/add',
      AddFAQScreen: '/home/dashboard/faqs/add',
      // AppointmentDetailsScreen handled as dynamic with optional id
    }),
    []
  );

  const pathMatchers = useMemo(
    () => [
      { key: 'Dashboard', match: (p) => p === '/home/dashboard' || p === '/' },
      { key: 'Login', match: (p) => p === '/home/dashboard/login' },
      { key: 'SuperuserDashboard', match: (p) => p === '/home/dashboard/superuser' },
      { key: 'Appointment', match: (p) => p === '/home/dashboard/appointments' },
      { key: 'Services', match: (p) => p === '/home/dashboard/services' },
      { key: 'FAQs', match: (p) => p === '/home/dashboard/faqs' },
      { key: 'AddServiceScreen', match: (p) => p === '/home/dashboard/services/add' },
      { key: 'AddFAQScreen', match: (p) => p === '/home/dashboard/faqs/add' },
      { key: 'Notifications', match: (p) => p === '/home/dashboard/notifications' },
      { key: 'Reports', match: (p) => p === '/home/dashboard/reports' },
      { key: 'Settings', match: (p) => p === '/home/dashboard/settings' },
      {
        key: 'AppointmentDetailsScreen',
        match: (p) => {
          // matches /home/dashboard/appointments/<id>
          const m = p.match(/^\/home\/dashboard\/appointments\/([^\/]+)$/);
          return m ? { params: { id: decodeURIComponent(m[1]) } } : false;
        },
      },
    ],
    []
  );

  // Load persisted user (web) and sync initial route
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = window.localStorage.getItem('currentUser');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed?.id) return;
        console.log('[Auth] Loaded user from storage', { id: parsed.id, email: parsed.email });
        await loadStoredSupabaseCredentials(parsed.id);
        if (isMounted) {
          setCurrentUser(parsed);
        }
      } catch (error) {
        console.warn('[Auth] Failed to restore session from storage', error);
      }
    };
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onSupabaseClientChange(() => {
      setSupabaseVersion((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  // On web, sync initial path and handle back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyPath = (pathname) => {
      for (const matcher of pathMatchers) {
        const result = typeof matcher.match === 'function' ? matcher.match(pathname) : false;
        if (result || result === false) {
          if (result) {
            const matchedKey = matcher.key;
            const extraProps = result.params ? result.params : {};
            setActiveRoute(matchedKey);
            setRouteProps((prev) => ({ ...prev, [matchedKey]: extraProps }));
            return true;
          }
        } else if (matcher.match === pathname) {
          setActiveRoute(matcher.key);
          return true;
        }
      }
      // Default fallback
      setActiveRoute('Dashboard');
      return false;
    };

    // Initialize from current path
    applyPath(window.location.pathname);

    const onPopState = (e) => {
      applyPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [pathMatchers]);

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
    if (!currentUser) return undefined;
    const client = supabase;
    if (!client) return undefined;

    let isMounted = true;

    const fetchUnreadCount = async () => {
      console.log('[Notifications] Fetching unread count', {
        userId: currentUser?.id,
        supabaseConfigured: !!client,
      });
      try {
        const { count, error } = await client
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        if (error) throw error;

        if (isMounted) {
          setUnreadCount(count || 0);
          console.log('[Notifications] Unread count updated', { count });
        }
      } catch (err) {
        console.error('Error fetching unread notifications:', err);
      }
    };

    // Fetch initial count and keep polling (no websocket subscription)
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, supabaseVersion]);

  // Reset unread count when navigating to Notifications screen
  useEffect(() => {
    if (activeRoute === 'Notifications') {
      setUnreadCount(0);
    }
  }, [activeRoute]);

  const routes = useMemo(
    () => [
      { key: 'Login', component: LoginScreen },
      { key: 'Dashboard', component: HomeScreen },
      { key: 'SuperuserDashboard', component: SuperuserDashboardScreen },
      { key: 'Appointment', component: AppointmentScreen },
      { key: 'Services', component: ServicesScreen },
      { key: 'Notifications', component: NotificationScreen },
      { key: 'Reports', component: ReportsScreen },
      { key: 'Settings', component: SettingsScreen },
      { key: 'FAQs', component: FAQsScreen },
      { key: 'AppointmentDetailsScreen', component: AppointmentDetailsScreen },
      { key: 'AddServiceScreen', component: AddServiceScreen },
      { key: 'AddFAQScreen', component: AddFAQScreen },
    ],
    []
  );

  // Main navigation menu items (excludes detail/add screens)
  const mainMenuItems = useMemo(() => {
    const baseItems = [
      { key: 'Dashboard', label: 'Dashboard', component: HomeScreen },
      { key: 'Appointment', label: 'Appointments', component: AppointmentScreen },
      { key: 'Services', label: 'Services', component: ServicesScreen },
      { key: 'FAQs', label: 'FAQs', component: FAQsScreen },
      { key: 'Reports', label: 'Reports', component: ReportsScreen },
      { key: 'Settings', label: 'Settings', component: SettingsScreen },
    ];

    if (currentUser?.role === 'admin') {
      return [
        { key: 'SuperuserDashboard', label: 'Dashboard', component: SuperuserDashboardScreen },
        { key: 'Reports', label: 'Global Reports', component: ReportsScreen },
        { key: 'Settings', label: 'System Settings', component: SettingsScreen },
      ];
    }

    return baseItems;
  }, [currentUser]);

  // Navigation function to handle route changes with props
  const navigate = (routeName, props = {}) => {
    if (routeName === 'SuperuserDashboard' && currentUser?.role !== 'admin') {
      console.warn('[Auth] Attempted to access Superuser dashboard without admin role');
      routeName = 'Dashboard';
    }
    setActiveRoute(routeName);
    setRouteProps((prev) => ({
      ...prev,
      [routeName]: props,
    }));

    // Sync web URL
    if (typeof window !== 'undefined') {
      let nextPath = routeToPath[routeName] || '/home/dashboard';
      if (routeName === 'AppointmentDetailsScreen') {
        // Try to use id from props if available, otherwise fallback
        const id = props?.appointment?.id || props?.appointment?.appointment_id || props?.appointment?.sender_id || props?.id;
        if (id) {
          nextPath = `/home/dashboard/appointments/${encodeURIComponent(id)}`;
        } else {
          nextPath = '/home/dashboard/appointments';
        }
      }
      const currentPath = window.location.pathname;
      if (currentPath !== nextPath) {
        window.history.pushState({ routeName, props }, '', nextPath);
      }
    }
  };

  // Auth guards
  useEffect(() => {
    const fallbackRoute = currentUser?.role === 'admin' ? 'SuperuserDashboard' : 'Dashboard';

    if (!currentUser && activeRoute !== 'Login') {
      console.log('[Auth] No current user, redirecting to Login');
      setActiveRoute('Login');
      if (typeof window !== 'undefined') window.history.replaceState({}, '', routeToPath['Login']);
    }
    if (currentUser && activeRoute === 'Login') {
      console.log('[Auth] User present, redirecting to', fallbackRoute);
      setActiveRoute(fallbackRoute);
      if (typeof window !== 'undefined') window.history.replaceState({}, '', routeToPath[fallbackRoute] || routeToPath['Dashboard']);
    }
  }, [currentUser, activeRoute, routeToPath]);

  const handleLogin = (user) => {
    console.log('[Auth] handleLogin', { id: user?.id, email: user?.email });
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('currentUser', JSON.stringify(user)); } catch {}
    }
    const nextRoute = user?.role === 'admin' ? 'SuperuserDashboard' : 'Dashboard';
    navigate(nextRoute);
  };

  const handleLogout = async () => {
    console.log('[Auth] handleLogout');
    if (currentUser?.id) {
      await clearSupabaseCredentials(currentUser.id);
    }
    resetSupabaseClient();
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem('currentUser'); } catch {}
    }
    navigate('Login');
  };
  

  const headerHeight = isWeb ? (breakpoint === 'xl' || breakpoint === 'lg' ? 80 : 64) : 56;
  const logoSize = isWeb ? (breakpoint === 'xl' || breakpoint === 'lg' ? 28 : 24) : 22;
  const avatarSize = isWeb ? (breakpoint === 'xl' || breakpoint === 'lg' ? 40 : 34) : 32;

  const TopHeader = (props) => {
    return (
      <View style={[styles.headerContainer, { height: headerHeight }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={logoSize} color={Colors.primary} />
          <View style={styles.brandTextContainer}>
            <Text style={[styles.brandText, { fontSize: 16 * (isWeb ? scale : 1) }]}>Dental Analytics</Text>
            {currentUser?.role === 'admin' && (
              <Text style={[styles.brandTextSuffix, { fontSize: 12 * (isWeb ? scale : 1) }]}>/superuser</Text>
            )}
          </View>
        </View>
        <View style={styles.headerCenter}>
          {currentUser ? (
            <View style={styles.linksRow}>
              {mainMenuItems.map((route) => {
                const isActive = activeRoute === route.key;
                return (
                  <Pressable key={route.key} onPress={() => navigate(route.key)} style={styles.linkItem}>
                    <Text
                      style={[
                        styles.linkLabel,
                        { fontSize: 12 * (isWeb ? scale : 1), color: isActive ? Colors.primary : Colors.textSecondary },
                      ]}
                    >
                      {route.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.linkLabel, { color: Colors.textSecondary }]}>Please sign in</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {currentUser && (
            <>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigate('Notifications')}
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
              <TouchableOpacity onPress={() => setLogoutVisible(true)} style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="log-out" size={18} color="#fff" />
              </TouchableOpacity>
            </>
          )}
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
          const extra = route.key === 'Login' ? { onLogin: handleLogin } : {};
          return <Component key={route.key} navigation={{ navigate }} {...props} {...extra} />;
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

      {/* Logout confirmation modal */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sign out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={async () => {
                  setLogoutVisible(false);
                  await handleLogout();
                }}
              >
                <Text style={styles.modalConfirmText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  brandText: {
    color: Colors.text,
    fontWeight: '700',
  },
  brandTextSuffix: {
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'lowercase',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  modalMessage: {
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancel: {
    backgroundColor: 'transparent',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirm: {
    backgroundColor: Colors.primary,
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: '700',
  },
});

// Initialize web history sync once when module loads (no-op on native)
if (typeof window !== 'undefined') {
  // Basic SPA 404-safe popstate handling is managed inside the component via effects below
}
