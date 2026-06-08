import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { clientService } from "../services/clientService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { createCommonStyles } from "../styles/common.styles";
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { RiskLevel } from "../types";
import { Icon } from "../components/Icon";

export default function CreateClientScreen() {
  const { colors } = useTheme();
  const commonStyles = createCommonStyles(colors);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const editingClient = route.params?.client;
  
  const [nombre, setNombre] = useState(editingClient?.nombre || "");
  const [cedula, setCedula] = useState(editingClient?.cedula || "");
  const [telefono, setTelefono] = useState(editingClient?.telefono || "");
  const [direccion, setDireccion] = useState(editingClient?.direccion || "");
  const [observaciones, setObservaciones] = useState(editingClient?.observaciones || "");
  const [nivel_riesgo, setNivelRiesgo] = useState<RiskLevel>(editingClient?.nivel_riesgo || "Bajo");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(
    editingClient?.latitud ? { lat: editingClient.latitud, lng: editingClient.longitud } : null
  );
  const [photo, setPhoto] = useState<string | null>(editingClient?.foto_url || editingClient?.foto_local_path || null);
  
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'info', text1: 'Permiso denegado', text2: 'No podremos capturar la ubicación automáticamente.' });
        return;
      }
      getCurrentLocation();
    })();
  }, []);

  const getCurrentLocation = async () => {
    setLocLoading(true);
    try {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (e) {
      console.error(e);
    } finally {
      setLocLoading(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    const { status } = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permiso denegado' });
      return;
    }

    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ quality: 0.5 }) 
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!nombre || !cedula) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Nombre y Cédula son obligatorios' });
      return;
    }

    setLoading(true);
    try {
        const payload = { 
            nombre, 
            cedula, 
            telefono, 
            direccion,
            latitud: location?.lat,
            longitud: location?.lng,
            observaciones,
            nivel_riesgo,
            foto_local_path: photo && photo.startsWith('file://') ? photo : undefined,
            foto_url: photo && photo.startsWith('http') ? photo : undefined
        };

        if (editingClient) {
            await clientService.updateClient(editingClient.id, payload);
            Toast.show({ type: 'success', text1: '¡Actualizado!', text2: 'Cliente actualizado correctamente' });
        } else {
            await clientService.createClient(payload);
            Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Cliente creado correctamente' });
        }
        
      navigation.goBack();
    } catch (error: any) {
      console.error("Submit Client Error:", error);
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: error.message || 'No se pudo guardar el cliente' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity 
            style={commonStyles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={commonStyles.backButtonText}>‹ Volver</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
          </Text>
          
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={[styles.photoBox, { borderColor: colors.border, backgroundColor: colors.bgDark }]}
              onPress={() => pickImage(false)}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <Text style={{ color: colors.textSecondary }}>📸 Foto del Cliente</Text>
              )}
            </TouchableOpacity>
            <View style={styles.photoActions}>
              <TouchableOpacity style={[styles.miniBtn, { backgroundColor: colors.primary }]} onPress={() => pickImage(true)}>
                <Text style={styles.miniBtnText}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.miniBtn, { backgroundColor: colors.success }]} onPress={() => pickImage(false)}>
                <Text style={styles.miniBtnText}>Galería</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre Completo</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={nombre} 
              onChangeText={setNombre} 
              placeholder="Ej: Juan Pérez"
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Cédula / DNI</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={cedula} 
              onChangeText={setCedula} 
              placeholder="000-0000000-0"
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={telefono} 
              onChangeText={setTelefono} 
              keyboardType="phone-pad"
              placeholder="809-000-0000"
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Dirección</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary }]} 
              value={direccion} 
              onChangeText={setDireccion} 
              placeholder="Calle #, Sector, Ciudad"
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Ubicación GPS</Text>
              <TouchableOpacity onPress={getCurrentLocation}>
                <Text style={{ color: colors.success, fontSize: 12 }}>{locLoading ? "Calculando..." : "🔄 Actualizar"}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, justifyContent: 'center' }]}>
              {locLoading ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : (
                <Text style={{ color: location ? colors.textPrimary : colors.textSecondary }}>
                  {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Ubicación no capturada"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nivel de Riesgo</Text>
            <View style={styles.riskContainer}>
              {(['Bajo', 'Medio', 'Alto'] as RiskLevel[]).map(r => (
                <TouchableOpacity 
                  key={r}
                  onPress={() => setNivelRiesgo(r)}
                  style={[
                    styles.riskBtn, 
                    { borderColor: colors.border },
                    nivel_riesgo === r && { backgroundColor: r === 'Bajo' ? colors.success : r === 'Medio' ? colors.warning : colors.accent }
                  ]}
                >
                  <Text style={[styles.riskText, nivel_riesgo === r && { color: '#fff' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Observaciones</Text>
            <TextInput 
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.bgDark, color: colors.textPrimary, height: 100, textAlignVertical: 'top' }]} 
              value={observaciones} 
              onChangeText={setObservaciones} 
              multiline
              placeholder="Ej: Trabaja en ferretería, paga después de las 5 PM."
              placeholderTextColor={colors.textSecondary} 
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: editingClient ? colors.success : colors.primary }, loading && styles.disabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
                {loading ? (editingClient ? "Actualizando..." : "Creando...") : (editingClient ? "Guardar Cambios" : "Guardar Cliente")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </BackgroundWrapper>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, padding: 15, borderRadius: 14, fontSize: 16 },
  button: { padding: 18, borderRadius: 16, alignItems: "center", marginTop: 20, marginBottom: 40 },
  disabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: "bold" },
  photoSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  photoBox: { width: 100, height: 100, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoActions: { marginLeft: 20, flex: 1 },
  miniBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  miniBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  riskContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  riskBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  riskText: { fontWeight: 'bold', color: '#666' },
});
