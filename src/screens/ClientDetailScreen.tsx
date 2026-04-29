import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Linking, 
  Platform,
  RefreshControl
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { clientService } from "../services/clientService";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createClientDetailStyles } from "../styles/clientDetail.styles";
import { createCommonStyles } from "../styles/common.styles";

export default function ClientDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { clientId } = route.params;
  const { colors } = useTheme();
  const styles = createClientDetailStyles(colors);
  const commonStyles = createCommonStyles(colors);

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await clientService.getClientById(clientId);
      setClient(data);
    } catch (error) {
      console.error("Error fetching client detail:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [clientId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const openMap = (direccion: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(direccion)}`,
      android: `geo:0,0?q=${encodeURIComponent(direccion)}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    Linking.openURL(url);
  };

  if (loading && !refreshing) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color={colors.success} style={{ marginTop: 100 }} />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[commonStyles.backButton, { alignSelf: 'flex-start' }]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={commonStyles.backButtonText}>‹ Volver</Text>
            </TouchableOpacity>

            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{client?.nombre?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.clientName}>{client?.nombre}</Text>
            <Text style={styles.clientId}>Cédula: {client?.cedula}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{client?.prestamos?.length || 0}</Text>
                <Text style={styles.statLabel}>Préstamos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>Activo</Text>
                <Text style={styles.statLabel}>Estado</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            {/* Contacto */}
            <Text style={styles.sectionTitle}>📍 Ubicación y Contacto</Text>
            <View style={[styles.contactCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${client?.telefono}`)}
              >
                <Text style={styles.contactIcon}>📱</Text>
                <Text style={styles.contactText}>{client?.telefono || "Sin teléfono"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactRowLast}
                onPress={() => openMap(client?.direccion)}
              >
                <Text style={styles.contactIcon}>🏠</Text>
                <Text style={styles.contactText}>{client?.direccion || "Sin dirección"}</Text>
              </TouchableOpacity>
            </View>

            {/* Préstamos */}
            <Text style={styles.sectionTitle}>📄 Historial de Préstamos</Text>
            {client?.prestamos?.length > 0 ? client.prestamos.map((loan: any) => (
              <TouchableOpacity 
                key={loan.id} 
                style={[styles.loanCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
                onPress={() => navigation.navigate("CreatePayment", { loanId: loan.id })}
              >
                <View style={styles.loanInfo}>
                  <Text style={styles.loanDate}>{new Date(loan.fecha_creacion).toLocaleDateString()}</Text>
                  <Text style={styles.loanAmount}>${loan.monto_prestado.toLocaleString()}</Text>
                </View>
                <View style={[styles.loanStatus, { backgroundColor: colors.success + "20" }]}>
                  <Text style={[styles.loanStatusText, { color: colors.success }]}>Pendiente</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyLoans}>
                <Text style={styles.emptyText}>No hay préstamos registrados</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.actionsFooter}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.bgDark, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => navigation.navigate("CreateLoan", { clientId: client?.id, clientName: client?.nombre })}
          >
            <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Nuevo Préstamo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("CreatePayment")}
          >
            <Text style={styles.actionBtnText}>Registrar Cobro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
