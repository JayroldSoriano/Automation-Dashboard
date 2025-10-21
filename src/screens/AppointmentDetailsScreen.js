import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import StatusBadge from '../components/StatusBadge';

const AppointmentDetailsScreen = ({ appointment, onBack }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.breadcrumbText}>Appointments</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>Appointment Details</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>Appointment Details</Text>
      <Text style={styles.subheader}>View and manage details for this appointment</Text>

      {/* Two-column layout */}
      <View style={styles.rowContainer}>
        {/* Left Column: Patient Details */}
        <View style={styles.leftCard}>
          {/* Patient Header */}
          <View style={styles.patientHeader}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{appointment?.patient_name || 'Unknown Patient'}</Text>
              <Text style={styles.patientId}>Patient ID: {appointment?.id?.slice(0, 6) || '—'}</Text>
            </View>
            <View style={styles.headerActionButtons}>
              <TouchableOpacity style={[styles.headerActionButton, styles.doneBtn]}>
                <MaterialIcons name="check-circle-outline" size={16} color="white" />
                <Text style={styles.headerActionText}>Mark as Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerActionButton, styles.cancelBtn]}>
                <MaterialIcons name="cancel" size={16} color="white" />
                <Text style={styles.headerActionText}>Mark as Cancelled</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Appointment Info */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            <DetailRow label="Date & Time" value={`${appointment?.scheduled_date || '—'} ${appointment?.scheduled_time || ''}`} />
            <DetailRow label="Reason for Visit" value={appointment?.service_name || '—'} />
            <DetailRow label="Assigned Dentist" value={appointment?.assigned_dentist || 'Dr. Emily Carter'} />
            <DetailRow label="Status" value={<StatusBadge status={appointment?.status} label={appointment?.status} />} />
            <DetailRow label="Notes" value={appointment?.notes || 'No notes available.'} />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#0288D1' }]}>
                <Text style={styles.quickBtnText}>Send Reminder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#01579B' }]}>
                <Text style={styles.quickBtnText}>Edit Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#013A63' }]}>
                <Text style={styles.quickBtnText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Column: Conversation */}
        <View style={styles.rightCard}>
          <View style={styles.conversationHeader}>
            <Text style={styles.sectionTitle}>Conversation with Messaging</Text>
            <View style={styles.agentToggle}>
              <Text style={styles.toggleLabel}>AI Agent Active</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </View>

          <View style={styles.conversationContent}>
            {/* Chat Section */}
            <View style={styles.chatContainer}>
              <View style={styles.chatBubbleLeft}>
                <Text style={styles.chatText}>
                  Hi Sophia, just a reminder about your appointment tomorrow at 10:00 AM.
                </Text>
                <Text style={styles.chatTimestamp}>July 19, 2024, 3:45 PM</Text>
              </View>
              <View style={styles.chatBubbleRight}>
                <Text style={styles.chatText}>Thanks for the reminder! See you then.</Text>
                <Text style={styles.chatTimestamp}>July 19, 2024, 4:02 PM</Text>
              </View>
            </View>

            {/* Input Box */}
            <View style={styles.inputBox}>
              <Text style={styles.inputPlaceholder}>Type a message...</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Subcomponent for detail rows
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    {typeof value === 'string' ? (
      <Text style={styles.detailValue}>{value}</Text>
    ) : (
      value
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  breadcrumbText: { color: Colors.textSecondary, fontSize: 16 },
  breadcrumbSeparator: { color: Colors.textSecondary, marginHorizontal: 8, fontSize: 16 },
  breadcrumbActive: { color: Colors.text, fontWeight: '600', fontSize: 16 },
  header: { fontSize: 30, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  subheader: { fontSize: 17, color: Colors.textSecondary, marginBottom: Layout.spacing.xl },
  rowContainer: { flexDirection: 'row', gap: 24 },
  leftCard: {
    flex: 2,
    backgroundColor: '#0F1A20',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rightCard: {
    flex: 1.5,
    backgroundColor: '#0F1A20',
    borderRadius: 14,
    padding: 24,
    justifyContent: 'space-between',
  },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, justifyContent: 'space-between' },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1d293b' },
  patientInfo: { flex: 1 },
  patientName: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  patientId: { color: Colors.textSecondary, fontSize: 14 },
  headerActionButtons: { flexDirection: 'row', gap: 6 },
  headerActionButton: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    gap: 4,
  },
  doneBtn: { backgroundColor: '#1B5E20' },
  cancelBtn: { backgroundColor: '#B71C1C' },
  headerActionText: { color: 'white', fontWeight: '600', fontSize: 12 },
  detailsSection: { marginBottom: 22 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  detailRow: { marginBottom: 12 },
  detailLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  detailValue: { color: Colors.text, fontSize: 16, lineHeight: 24 },
  quickActions: { borderTopWidth: 1, borderTopColor: '#1e2c35', paddingTop: 16 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  quickBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  conversationContent: { flex: 1, justifyContent: 'space-between' },
  agentToggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { color: Colors.textSecondary, fontSize: 14 },
  chatContainer: { 
    flex: 1,
    gap: 16, 
    justifyContent: 'flex-start',
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#162630',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#0277BD',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  chatText: { color: 'white', fontSize: 14, lineHeight: 20 },
  chatTimestamp: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  inputBox: { backgroundColor: '#172131', padding: 12, borderRadius: 8 },
  inputPlaceholder: { color: Colors.textSecondary, fontSize: 14 },
});

export default AppointmentDetailsScreen;
