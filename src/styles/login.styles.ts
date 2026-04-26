import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const createLoginStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
    resizeMode: "contain",
  },
  content: {
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 5,
  },
  form: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "rgba(248, 250, 252, 0.8)",
    borderWidth: 1,
    borderColor: theme === "dark" ? "#334155" : "#cbd5e1",
    padding: 15,
    borderRadius: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  }
});
