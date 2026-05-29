import { StyleSheet, Platform, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const createLoginStyles = (colors: any, theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: 40,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      alignItems: "center",
    },
    logo: {
      width: 160,
      height: 160,
      marginBottom: 10,
      resizeMode: "contain",
    },
    content: {
      paddingHorizontal: 25,
    },
    form: {
      padding: 28,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "rgba(74, 222, 128, 0.12)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
    formTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: "#cbd5e1",
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor:
        theme === "dark"
          ? "rgba(30, 41, 59, 0.5)"
          : "rgba(248, 250, 252, 0.8)",
      borderWidth: 1,
      borderColor: theme === "dark" ? "#334155" : "#cbd5e1",
      paddingVertical: 14,
      paddingHorizontal: 15,
      borderRadius: 14,
      fontSize: 16,
      color: colors.textPrimary,
    },
    /* Password row */
    passwordWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    passwordInput: {
      paddingRight: 50, // espacio para el ícono
    },
    eyeButton: {
      position: "absolute",
      right: 14,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    /* Submit button */
    button: {
      padding: 18,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 12,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
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
    },
  });
