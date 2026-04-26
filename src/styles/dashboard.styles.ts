import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const createDashboardStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarMiniText: {
    fontWeight: "bold",
    color: colors.success,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    padding: 24,
    borderRadius: 28,
    marginBottom: 30,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  eyeIcon: {
    color: "#fff",
    fontSize: 16,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  balanceFooter: {
    marginTop: 20,
  },
  trendBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  trendText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  actionItem: {
    alignItems: "center",
    width: (width - 48) / 3.5,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.bgDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconEmoji: {
    fontSize: 24,
  },
  iconLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  viewMore: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.success,
  },
  activityCard: {
    backgroundColor: colors.bgDark,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityIconText: {
    color: colors.success,
    fontWeight: "bold",
    fontSize: 18,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  activityAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  statusTextMini: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 2,
  },
  emptyActivity: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  }
});
