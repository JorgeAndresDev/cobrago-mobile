import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  Platform,
  RefreshControl,
  Image,
  Alert,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { clientService } from "../services/clientService";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createClientDetailStyles } from "../styles/clientDetail.styles";
import { createCommonStyles } from "../styles/common.styles";
import { Icon } from "../components/Icon";
import { ConfirmModal } from "../components/ConfirmModal";
import Toast from "react-native-toast-message";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDelete = async () => {
    try {
      setLoading(true);
      await clientService.deleteClient(clientId);
      setShowDeleteModal(false);
      
      Toast.show({ 
        type: 'success', 
        text1: '¡Cliente Eliminado!', 
        text2: 'El registro ha sido borrado exitosamente del sistema.' 
      });
      
      navigation.navigate("Clientes");
    } catch (error: any) {
      console.error("Delete Error:", error);
      setShowDeleteModal(false);
      
      const errorMsg = error.response?.data?.detail || "No se pudo eliminar al cliente por un problema técnico.";
      
      Toast.show({ 
        type: 'error', 
        text1: 'Error al Eliminar', 
        text2: errorMsg 
      });
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const openMap = (type: 'google' | 'waze') => {
    const lat = client?.latitud;
    const lng = client?.longitud;
    const address = client?.direccion;

    if (type === 'google') {
      const url = lat && lng 
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    } else {
      const url = lat && lng
        ? `waze://?ll=${lat},${lng}&navigate=yes`
        : `waze://?q=${encodeURIComponent(address)}&navigate=yes`;
        
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Waze no instalado", "Parece que no tienes Waze instalado en tu dispositivo.");
        }
      });
    }
  };

  const RiskBadge = ({ level }: { level: string }) => {
    const color = level === 'Bajo' ? colors.success : level === 'Medio' ? colors.warning : colors.accent;
    return (
      <View style={[styles.riskBadge, { backgroundColor: color + '20' }]}>
        <View style={[styles.riskDot, { backgroundColor: color }]} />
        <Text style={[styles.riskText, { color }]}>{level}</Text>
      </View>
    );
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <TouchableOpacity 
                  style={[commonStyles.backButton, { alignSelf: 'flex-start' }]} 
                  onPress={() => navigation.goBack()}
                >
                  <Text style={commonStyles.backButtonText}>‹ Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ padding: 8 }}
                  onPress={() => navigation.navigate("CreateClient", { client })}
                >
                  <Icon name="pencil" size={24} color={colors.success} />
                </TouchableOpacity>
            </View>

            <View style={styles.avatarLarge}>
              {(client?.foto_url || client?.foto_local_path) ? (
                <Image source={{ uri: client.foto_url || client.foto_local_path }} style={styles.clientPhoto} />
              ) : (
                <Text style={styles.avatarText}>{client?.nombre?.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.clientName}>{client?.nombre}</Text>
            <Text style={styles.clientId}>Cédula: {client?.cedula}</Text>
            
            <RiskBadge level={client?.nivel_riesgo || 'Bajo'} />

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
            {/* Ubicación y Contacto */}
            <Text style={styles.sectionTitle}>📍 Ubicación y Contacto</Text>
            <View style={[styles.contactCard, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${client?.telefono}`)}
              >
                <Text style={styles.contactIcon}>📱</Text>
                <Text style={styles.contactText}>{client?.telefono || "Sin teléfono"}</Text>
              </TouchableOpacity>
              
              <View style={styles.contactRowLast}>
                <Text style={styles.contactIcon}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactText}>{client?.direccion || "Sin dirección"}</Text>
                  <View style={styles.mapActions}>
                    <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.primary + '20' }]} onPress={() => openMap('google')}>
                      <Text style={[styles.mapBtnText, { color: colors.primary }]}>Google Maps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.success + '20' }]} onPress={() => openMap('waze')}>
                      <Text style={[styles.mapBtnText, { color: colors.success }]}>Waze</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Observaciones */}
            <Text style={styles.sectionTitle}>📝 Observaciones</Text>
            <View style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
              <Text style={{ color: client?.observaciones ? colors.textPrimary : colors.textSecondary }}>
                {client?.observaciones || "No hay observaciones para este cliente."}
              </Text>
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
                  <Text style={styles.loanAmount}>${(loan.monto_prestado || loan.monto).toLocaleString()}</Text>
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

            <TouchableOpacity 
              style={extraStyles.deleteBtn}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={extraStyles.deleteBtnText}>🗑️ Eliminar Cliente</Text>
            </TouchableOpacity>
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

        <ConfirmModal 
          visible={showDeleteModal}
          title="Eliminar Cliente"
          message="¿Estás seguro de que quieres eliminar a este cliente? Esta acción no se puede deshacer y borrará todos sus préstamos."
          confirmText="Eliminar"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const extraStyles = StyleSheet.create({
  deleteBtn: {
    marginTop: 40,
    marginBottom: 40,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff444430',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
