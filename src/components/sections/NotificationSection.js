import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const NOTIFICATION_TABLE_COLUMNS = ['TITLE', 'MESSAGE', 'TYPE', 'STATUS', 'PRIORITY', 'DATE', 'ACTIONS'];

const NotificationSection = ({ notifications = [], onRowPress, onMarkAsRead, onDelete }) => {
  console.log('NotificationSection received notifications:', notifications?.length || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#EF4444'; // Red
      case 'medium': return '#F59E0B'; // Orange
      case 'low': return '#10B981'; // Green
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'unread': return '#3B82F6'; // Blue
      case 'read': return '#6B7280'; // Gray
      default: return Colors.textSecondary;
    }
  };

  const renderTableData = () => {
    return notifications.map((notification, index) => {
      const notificationKey = `${notification.notification_id || notification.title}-${index}`;
      
      return {
        key: notificationKey,
        data: [
          <Text style={styles.cellPrimary}>{notification.title}</Text>, // Title
          <Text style={styles.cellDescription} numberOfLines={2}>{notification.message || '—'}</Text>, // Message
          <Text style={styles.cellSecondary}>{notification.notification_type}</Text>, // Type
          <Text style={[styles.cellStatus, { color: getStatusColor(notification.status) }]}>
            {notification.status?.charAt(0).toUpperCase() + notification.status?.slice(1) || '—'}
          </Text>, // Status
          <Text style={[styles.cellPriority, { color: getPriorityColor(notification.priority) }]}>
            {notification.priority?.charAt(0).toUpperCase() + notification.priority?.slice(1) || '—'}
          </Text>, // Priority
          <Text style={styles.cellDate}>{formatDate(notification.created_at)}</Text>, // Date
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onMarkAsRead && onMarkAsRead(notification)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="mark-email-read" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onDelete && onDelete(notification)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>, // Actions
        ],
        notification
      };
    });
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {NOTIFICATION_TABLE_COLUMNS.map((col, colIndex) => {
          let cellStyle = styles.cell;
          if (colIndex === 0) cellStyle = [styles.cell, styles.titleCell]; // Title
          else if (colIndex === 1) cellStyle = [styles.cell, styles.messageCell]; // Message
          else if (colIndex === 2) cellStyle = [styles.cell, styles.typeCell]; // Type
          else if (colIndex === 3) cellStyle = [styles.cell, styles.statusCell]; // Status
          else if (colIndex === 4) cellStyle = [styles.cell, styles.priorityCell]; // Priority
          else if (colIndex === 5) cellStyle = [styles.cell, styles.dateCell]; // Date
          else if (colIndex === 6) cellStyle = [styles.cell, styles.actionsCell]; // Actions
          
          return (
            <View key={col} style={cellStyle}>
              <Text style={styles.headerText}>{col.toUpperCase()}</Text>
            </View>
          );
        })}
      </View>

      {/* Table Body */}
      <ScrollView 
        style={styles.tableBody}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {renderTableData().map((rowData, rowIndex) => (
          <TouchableOpacity
            key={`row-${rowIndex}`}
            style={[
              styles.tableRow,
              rowIndex === renderTableData().length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={() => onRowPress && onRowPress(rowData.notification)}
            activeOpacity={0.7}
          >
            {rowData.data.map((cell, colIndex) => {
              let cellStyle = styles.cell;
              if (colIndex === 0) cellStyle = [styles.cell, styles.titleCell]; // Title
              else if (colIndex === 1) cellStyle = [styles.cell, styles.messageCell]; // Message
              else if (colIndex === 2) cellStyle = [styles.cell, styles.typeCell]; // Type
              else if (colIndex === 3) cellStyle = [styles.cell, styles.statusCell]; // Status
              else if (colIndex === 4) cellStyle = [styles.cell, styles.priorityCell]; // Priority
              else if (colIndex === 5) cellStyle = [styles.cell, styles.dateCell]; // Date
              else if (colIndex === 6) cellStyle = [styles.cell, styles.actionsCell]; // Actions
              
              return (
                <View key={`cell-${colIndex}`} style={cellStyle}>
                  {cell}
                </View>
              );
            })}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = {
  tableContainer: {
    backgroundColor: '#121e23', // table bg
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
    height: 400, // Fixed height for the table
    width: '100%', // Full width
    flex: 1, // Take available space
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#172131', // header bg
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%', // Full width
  },
  headerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  tableBody: {
    backgroundColor: '#111d22',
    flex: 1, // Take remaining space after header
    width: '100%', // Full width
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2b3a4c', // subtle separator line
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%', // Full width
  },
  cell: {
    flex: 1,
  },
  titleCell: {
    flex: 1.5, // Title gets more space
  },
  messageCell: {
    flex: 2.5, // Message gets the most space
  },
  typeCell: {
    flex: 1, // Type gets standard space
  },
  statusCell: {
    flex: 1, // Status gets standard space
  },
  priorityCell: {
    flex: 1, // Priority gets standard space
  },
  dateCell: {
    flex: 1.2, // Date gets slightly more space
  },
  actionsCell: {
    flex: 0.8, // Actions gets less space (rightmost)
  },
  cellPrimary: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cellSecondary: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  cellDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  cellStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  cellPriority: {
    fontSize: 13,
    fontWeight: '600',
  },
  cellDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
};

export default NotificationSection;
