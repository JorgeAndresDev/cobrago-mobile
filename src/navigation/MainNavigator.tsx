import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import LoansScreen from "../screens/LoansScreen";
import CreateClientScreen from "../screens/CreateClientScreen";
import CreateLoanScreen from "../screens/CreateLoanScreen";
import CreatePaymentScreen from "../screens/CreatePaymentScreen";
import HelpScreen from "../screens/HelpScreen";
import ClientDetailScreen from "../screens/ClientDetailScreen";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* El TabNavigator contiene el Dashboard, Clientes, Pagos y Perfil */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Pantallas de sub-navegación (Stack) */}
      <Stack.Screen name="Loans" component={LoansScreen} />
      <Stack.Screen name="CreateClient" component={CreateClientScreen} />
      <Stack.Screen name="CreateLoan" component={CreateLoanScreen} />
      <Stack.Screen name="CreatePayment" component={CreatePaymentScreen} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}
