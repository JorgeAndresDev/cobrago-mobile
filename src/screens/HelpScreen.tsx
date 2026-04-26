import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import BackgroundWrapper from "../components/BackgroundWrapper";

export default function HelpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.success }]}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Centro de Ayuda</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>🏠 Inicio (Dashboard)</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            El panel principal te ofrece un resumen en tiempo real del dinero recaudado hoy y tu cartera total activa. También puedes ver los últimos préstamos y pagos realizados, junto con accesos rápidos para gestionar clientes o registrar pagos.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>👥 Clientes</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            En la sección de clientes, puedes visualizar todo tu directorio. Para registrar un nuevo préstamo a un cliente, simplemente presiona el botón de "+" situado en su tarjeta. Desde esta vista también puedes agregar nuevos clientes a la plataforma.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>💰 Cobrar (Pagos)</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            El módulo de cobro te permite registrar rápidamente los abonos de los clientes. Al seleccionar un préstamo activo, ingresas el monto pagado y este se descuenta automáticamente del saldo de la deuda, reflejándose inmediatamente en tu recaudo diario.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>📄 Préstamos</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Muestra el historial y estado de todos los préstamos emitidos. Puedes revisar los detalles financieros como la cuota, frecuencia, saldo restante y monitorear si un préstamo está en estado "Pendiente" o ha sido "Pagado" por completo.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>👤 Perfil</Text>
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Puedes personalizar la apariencia de la aplicación usando el interruptor de Modo Oscuro/Claro. La aplicación guardará tus preferencias. También puedes cerrar tu sesión de forma segura.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
