import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
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

const AppNavigator = () => {
  const { isWeb, breakpoint, scale } = useResponsive();
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [routeProps, setRouteProps] = useState({});

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
            <Ionicons name="notifications" size={24} color={Colors.textSecondary} />
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
});
