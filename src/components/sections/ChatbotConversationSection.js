import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const CHATBOT_CONVERSATION_COLUMNS = ['SESSION ID', 'PATIENT NAME', 'LAST MESSAGE', 'LAST AI REPLY', 'TIMESTAMP'];

const ChatbotConversationSection = ({ conversations = [], onRowPress }) => {
  console.log('ChatbotConversationSection received conversations:', conversations?.length || 0);

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
      
      return {
        key: conversationKey,
        data: [
          <Text style={styles.cellSecondary}>{conversation.session_id || '—'}</Text>, // Session ID
          <Text style={styles.cellPrimary}>{conversation.patient_name || '—'}</Text>, // Patient Name
          <Text style={styles.cellDescription} numberOfLines={2}>{conversation.last_message || '—'}</Text>, // Last Message
          <Text style={styles.cellDescription} numberOfLines={2}>{conversation.last_ai_reply || '—'}</Text>, // Last AI Reply
          <Text style={styles.cellDate}>{formatDate(conversation.timestamp)}</Text>, // Timestamp
        ],
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
          if (colIndex === 0) cellStyle = [styles.cell, styles.sessionIdCell]; // Session ID
          else if (colIndex === 1) cellStyle = [styles.cell, styles.patientNameCell]; // Patient Name
          else if (colIndex === 2) cellStyle = [styles.cell, styles.lastMessageCell]; // Last Message
          else if (colIndex === 3) cellStyle = [styles.cell, styles.lastAiReplyCell]; // Last AI Reply
          else if (colIndex === 4) cellStyle = [styles.cell, styles.timestampCell]; // Timestamp
          
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
            onPress={() => onRowPress && onRowPress(rowData.conversation)}
            activeOpacity={0.7}
          >
            {rowData.data.map((cell, colIndex) => {
              let cellStyle = styles.cell;
              if (colIndex === 0) cellStyle = [styles.cell, styles.sessionIdCell]; // Session ID
              else if (colIndex === 1) cellStyle = [styles.cell, styles.patientNameCell]; // Patient Name
              else if (colIndex === 2) cellStyle = [styles.cell, styles.lastMessageCell]; // Last Message
              else if (colIndex === 3) cellStyle = [styles.cell, styles.lastAiReplyCell]; // Last AI Reply
              else if (colIndex === 4) cellStyle = [styles.cell, styles.timestampCell]; // Timestamp
              
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
