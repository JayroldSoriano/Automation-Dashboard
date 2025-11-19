import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const ChatbotConversationSection = ({ conversations = [], onRowPress, showBusiness = false, businessMap = {} }) => {
  console.log('ChatbotConversationSection received conversations:', conversations?.length || 0);

  // Determine columns based on whether business info should be shown
  const CHATBOT_CONVERSATION_COLUMNS = React.useMemo(() => {
    const baseColumns = ['SESSION ID', 'PATIENT NAME', 'LAST MESSAGE', 'LAST AI REPLY', 'TIMESTAMP'];
    if (showBusiness) {
      // Insert BUSINESS column after PATIENT NAME
      baseColumns.splice(2, 0, 'BUSINESS');
    }
    return baseColumns;
  }, [showBusiness]);

  const getBusinessName = (businessId) => {
    if (!businessId || !businessMap[businessId]) return '—';
    return businessMap[businessId].business_name || businessMap[businessId].email || '—';
  };

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

  const renderTableData = () => {
    return conversations.map((conversation, index) => {
      const conversationKey = `${conversation.session_id || conversation.id}-${index}`;
      
      // Build data array based on columns
      const data = [
        <Text style={styles.cellSecondary}>{conversation.session_id || '—'}</Text>, // Session ID
        <Text style={styles.cellPrimary}>{conversation.patient_name || '—'}</Text>, // Patient Name
      ];

      // Add Business column if showBusiness is true
      if (showBusiness) {
        data.push(
          <Text style={styles.cellSecondary} numberOfLines={1}>
            {getBusinessName(conversation.business_id)}
          </Text> // Business
        );
      }

      // Add remaining columns
      data.push(
        <Text style={styles.cellDescription} numberOfLines={2}>{conversation.last_message || '—'}</Text>, // Last Message
        <Text style={styles.cellDescription} numberOfLines={2}>{conversation.last_ai_reply || '—'}</Text>, // Last AI Reply
        <Text style={styles.cellDate}>{formatDate(conversation.timestamp)}</Text>, // Timestamp
      );
      
      return {
        key: conversationKey,
        data,
        conversation
      };
    });
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {CHATBOT_CONVERSATION_COLUMNS.map((col, colIndex) => {
          let cellStyle = styles.cell;
          // Dynamic column styling based on column name
          if (col === 'SESSION ID') cellStyle = [styles.cell, styles.sessionIdCell];
          else if (col === 'PATIENT NAME') cellStyle = [styles.cell, styles.patientNameCell];
          else if (col === 'BUSINESS') cellStyle = [styles.cell, styles.businessCell];
          else if (col === 'LAST MESSAGE') cellStyle = [styles.cell, styles.lastMessageCell];
          else if (col === 'LAST AI REPLY') cellStyle = [styles.cell, styles.lastAiReplyCell];
          else if (col === 'TIMESTAMP') cellStyle = [styles.cell, styles.timestampCell];
          
          return (
            <View key={col} style={cellStyle}>
              <Text style={styles.headerText}>{col}</Text>
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
            onPress={() => onRowPress && onRowPress(rowData.conversation)}
            activeOpacity={0.7}
          >
            {rowData.data.map((cell, colIndex) => {
              const colName = CHATBOT_CONVERSATION_COLUMNS[colIndex];
              let cellStyle = styles.cell;
              // Match cell styling to column name
              if (colName === 'SESSION ID') cellStyle = [styles.cell, styles.sessionIdCell];
              else if (colName === 'PATIENT NAME') cellStyle = [styles.cell, styles.patientNameCell];
              else if (colName === 'BUSINESS') cellStyle = [styles.cell, styles.businessCell];
              else if (colName === 'LAST MESSAGE') cellStyle = [styles.cell, styles.lastMessageCell];
              else if (colName === 'LAST AI REPLY') cellStyle = [styles.cell, styles.lastAiReplyCell];
              else if (colName === 'TIMESTAMP') cellStyle = [styles.cell, styles.timestampCell];
              
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
    height: 500, // Fixed height for the table
    width: '100%', // Full width
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
    height: 436, // Fixed height for scrollable body (500 - 64 header height)
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
  sessionIdCell: {
    flex: 1.2, // Session ID gets slightly more space
  },
  patientNameCell: {
    flex: 1.5, // Patient Name gets more space
  },
  businessCell: {
    flex: 1.3, // Business name gets more space
  },
  lastMessageCell: {
    flex: 2, // Last Message gets the most space
  },
  lastAiReplyCell: {
    flex: 2, // Last AI Reply gets the most space
  },
  timestampCell: {
    flex: 1.3, // Timestamp gets slightly more space
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
  cellDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
};

export default ChatbotConversationSection;
