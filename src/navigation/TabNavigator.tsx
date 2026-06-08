import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import ClientsScreen from "../screens/ClientsScreen";
import CreatePaymentScreen from "../screens/CreatePaymentScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, { active: string; inactive: string }> = {
  Inicio:   { active: "grid",            inactive: "grid-outline" },
  Clientes: { active: "people",          inactive: "people-outline" },
  Pagar:    { active: "cash",            inactive: "cash-outline" },
  Perfil:   { active: "person-circle",   inactive: "person-circle-outline" },
};

export default function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const icon = tabIcons[route.name];
          const iconName = (focused ? icon?.active : icon?.inactive) ?? "ellipse-outline";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: colors.bgDark,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          // Altura dinámica: base 60 + el inset inferior del sistema
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.success,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: insets.bottom > 0 ? 0 : 5
        },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} />
      <Tab.Screen name="Clientes" component={ClientsScreen} />
      <Tab.Screen name="Pagar" component={CreatePaymentScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
