import { StyleSheet } from "react-native";

export const createCommonStyles = (colors: any) => StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  headerWithBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
  }
});
