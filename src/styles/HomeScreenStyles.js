import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    paddingTop: Layout.spacing.xl,
  },
  breadcrumbText: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  breadcrumbSeparator: {
    color: Colors.textSecondary,
    marginHorizontal: 8,
    fontSize: 16,
  },
  breadcrumbActive: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 34,
    paddingHorizontal: Layout.spacing.xl,
  },
  subheader: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
    lineHeight: 24,
    paddingHorizontal: Layout.spacing.xl,
  },
  topStatsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
  },
  flexItem: {
    flex: 1,
  },
  threeCardsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
  },
  cardItem: {
    flex: 1,
    minHeight: 400,
  },
  wideSection: {
    marginTop: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyStateContainer: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export const demographicsStyles = StyleSheet.create({
  demographicsRow: {
    flexDirection: 'column',
    gap: Layout.spacing.lg,
  },
  demographicBlockCentered: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
});

export const platformStyles = StyleSheet.create({
  emptyStateContainer: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  platformContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
    height: '100%',
    minHeight: 280,
  },
});

export const servicesStyles = StyleSheet.create({
  emptyStateContainer: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export const locationStyles = StyleSheet.create({
  emptyStateContainer: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  locationContainer: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationPlaceContainer: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  locationPlaceText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  locationStatsContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  locationCountText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  locationPercentageText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locationTotalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  locationTotalText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export const appointmentsStyles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderRadius: 8,
    shadowColor: Colors.shadow,
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
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  expandedSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  timePassedText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  dividerThin: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  inquiryNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
