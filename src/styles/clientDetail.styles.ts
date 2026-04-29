import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const createClientDetailStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: colors.success,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.success,
  },
  clientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  clientId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 25,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingVertical: 15,
    borderRadius: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 15,
    marginTop: 10,
  },
  contactCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 25,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactRowLast: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  loanCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loanInfo: {
    flex: 1,
  },
  loanDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loanAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 2,
  },
  loanStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loanStatusText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  emptyLoans: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 20,
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  actionsFooter: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  }
});
