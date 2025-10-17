import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconButton, Menu, Divider } from 'react-native-paper';
import DataTable from '../DataTable';
import StatusBadge from '../StatusBadge';
import Card from '../Card';
import { formatTime12h, getTimePassed } from '../../utils/dateUtils';
import { processAppointmentsForTable, processAppointmentsForCards } from '../../utils/dataUtils';
import { HOME_SCREEN_CONSTANTS } from '../../constants/HomeScreen';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

/**
 * Appointments section component with table and expanded views
 * @param {Object} props - Component props
 * @param {Array} props.appointments - Array of appointment data
 * @param {string} props.activeTab - Current view mode ('Table' or 'Expanded')
 * @param {string} props.toggleIcon - Icon for toggle button
 * @param {Function} props.onToggleView - Function to toggle view mode
 * @param {string} props.openMenuId - ID of currently open menu
 * @param {Function} props.onMenuOpen - Function to open menu
 * @param {Function} props.onMenuClose - Function to close menu
 * @param {Function} props.onMenuAction - Function to handle menu actions
 * @returns {JSX.Element} Appointments section
 */
const AppointmentsSection = ({
  appointments = [],
  activeTab,
  toggleIcon,
  onToggleView,
  openMenuId,
  onMenuOpen,
  onMenuClose,
  onMenuAction
}) => {
  const tableData = processAppointmentsForTable(appointments);
  const cardData = processAppointmentsForCards(appointments);

  const renderTableData = () => {
    return tableData.map(({ key, data }) => [
      data[0], // date
      data[1], // time
      data[2], // name
      data[3], // service
      <StatusBadge key={`status-${key}`} status={data[4].status} label={data[4].label} />,
    ]);
  };

  const renderExpandedCards = () => {
    return cardData.map((appt) => {
      const time = formatTime12h(appt.scheduled_time);
      const timePassed = getTimePassed(appt.appointment_created_at);

      return (
        <Card key={`appt-card-${appt.id}`} style={styles.expandedCard}>
          <View style={styles.headerRow}>
            <Text numberOfLines={1} style={styles.cardName}>
              {appt.name || 'Unknown Patient'}
            </Text>
            <Text style={styles.timePassedText}>{timePassed} ago</Text>
          </View>

          <Text style={styles.inquiryNumber}>
            Inquiry #: {appt.inquiryNumber}
          </Text>

          <View style={styles.dividerThin} />

          <View style={styles.headerRowInner}>
            <Text numberOfLines={1} style={styles.expandedTitleSmall}>Service Name:</Text>
            <Text numberOfLines={1} style={styles.expandedSubtitle}>
              {appt.service_name || '—'}
            </Text>
          </View>

          <View style={styles.headerRowInner}>
            <Text numberOfLines={1} style={styles.expandedTitleSmall}>Category:</Text>
            <Text numberOfLines={1} style={styles.expandedSubtitle}>
              {appt.service_category || '—'}
            </Text>
          </View>

          <View style={styles.headerRowInner}>
            <Text numberOfLines={1} style={styles.expandedTitleSmall}>Price:</Text>
            <Text numberOfLines={1} style={styles.expandedSubtitle}>
              ${appt.service_price || '—'}
            </Text>
          </View>

          <View style={styles.dividerThin} />

          <View style={styles.bottomRow}>
            <View style={styles.appointmentRequestCol}>
              <Text style={styles.appointmentRequestLabel}>Appointment Request</Text>
              <Text style={styles.appointmentDate}>{appt.displayDate} @ {time}</Text>
            </View>

            <Menu
              visible={openMenuId === appt.id}
              onDismiss={onMenuClose}
              anchor={
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onMenuOpen(appt.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: openMenuId === appt.id }}
                  accessibilityLabel="Open actions menu"
                >
                  <Text style={styles.actionButtonText}>Actions</Text>
                </TouchableOpacity>
              }
            >
              {HOME_SCREEN_CONSTANTS.MENU_ACTIONS.map((action) => (
                <Menu.Item 
                  key={action}
                  onPress={() => onMenuAction(action)} 
                  title={action} 
                />
              ))}
              <Divider />
            </Menu>
          </View>
        </Card>
      );
    });
  };

  return (
    <View style={styles.sectionInner}>
      {activeTab === HOME_SCREEN_CONSTANTS.VIEW_MODES.TABLE ? (
        <DataTable
          columns={HOME_SCREEN_CONSTANTS.TABLE_COLUMNS}
          data={renderTableData()}
        />
      ) : (
        <View style={styles.expandedRow}>
          {renderExpandedCards()}
        </View>
      )}
    </View>
  );
};

const styles = {
  sectionInner: {
    // Add any section-specific styles here
  },
  expandedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  expandedCard: {
    width: '31%',
    minWidth: 200,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  headerRowInner: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  expandedTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  expandedSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  timePassedText: {
    fontSize: 12,
    color: '#666',
    flexShrink: 0,
  },
  dividerThin: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  inquiryNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  appointmentRequestCol: {
    flex: 1,
  },
  appointmentRequestLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
};

export default AppointmentsSection;
