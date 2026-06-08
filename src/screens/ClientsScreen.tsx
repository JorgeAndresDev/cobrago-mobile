import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  RefreshControl,
  Linking,
  Platform,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clientService } from "../services/clientService";
import { Cliente } from "../types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Icon } from "../components/Icon";

export default function ClientsScreen() {
  const { colors } = useTheme();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [])
  );

  useEffect(() => {
    if (search === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(c => 
        c.nombre.toLowerCase().includes(search.toLowerCase()) || 
        c.cedula.includes(search)
      );
      setFilteredClients(filtered);
    }
  }, [search, clients]);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const openMap = (direccion: string) => {
    if (!direccion) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(direccion)}`,
      android: `geo:0,0?q=${encodeURIComponent(direccion)}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    
    Linking.openURL(url).catch(err => console.error("Error opening maps", err));
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.bgDark, borderColor: colors.border }]}
      onPress={() => navigation.navigate("ClientDetail", { clientId: item.id })}
    >
      <View style={styles.cardMain}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
          {item.foto_local_path || item.foto_url ? (
             <Image source={{ uri: item.foto_local_path || item.foto_url }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.success }]}>
              {item.nombre.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.nombre}</Text>
                {item.is_synced === 0 && <Icon name="clock" size={12} color={colors.warning} style={{ marginLeft: 6 }} />}
            </View>
            <View style={[
              styles.riskTag, 
              { backgroundColor: item.nivel_riesgo === 'Bajo' ? colors.success + '20' : item.nivel_riesgo === 'Medio' ? colors.warning + '20' : colors.accent + '20' }
            ]}>
              <Text style={[
                styles.riskTagText, 
                { color: item.nivel_riesgo === 'Bajo' ? colors.success : item.nivel_riesgo === 'Medio' ? colors.warning : colors.accent }
              ]}>
                {item.nivel_riesgo || 'Bajo'}
              </Text>
            </View>
          </View>
          <Text style={[styles.idText, { color: colors.textSecondary }]}>C.C. {item.cedula}</Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border + "30" }]}>
        <View style={styles.contactInfo}>
          {item.telefono && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${item.telefono}`)}
            >
              <Icon name="phone" size={14} color={colors.success} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>{item.telefono}</Text>
            </TouchableOpacity>
          )}
          {item.direccion && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => openMap(item.direccion!)}
            >
              <Icon name="map-pin" size={14} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.direccion}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.smallActionButton, { backgroundColor: colors.primary + "20" }]}
          onPress={() => navigation.navigate("CreateLoan", { clientId: item.id, clientName: item.nombre })}
        >
          <Text style={[styles.smallActionText, { color: colors.primary }]}>Prestar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Mis Clientes</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("CreateClient")}
          >
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchWrapper, { backgroundColor: colors.bgDark, borderColor: colors.border }]}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar por nombre o cédula..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.success} />
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => String(item.id ?? Math.random())}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBox, { backgroundColor: colors.bgDark }]}>
                    <Icon name="users" size={48} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No se encontraron clientes</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 24, 
    paddingTop: 60,
    paddingBottom: 20
  },
  title: { fontSize: 28, fontWeight: "bold" },
  addButton: { 
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    height: 54,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  card: { 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1,
    overflow: "hidden",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  name: { fontSize: 17, fontWeight: "bold" },
  idText: { fontSize: 13, marginTop: 4, opacity: 0.7 },
  cardFooter: {
    borderTopWidth: 1,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contactInfo: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  contactText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },
  smallActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyContainer: { 
    padding: 60, 
    alignItems: "center",
    marginTop: 40
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyText: { 
    textAlign: "center",
    fontSize: 14,
    fontWeight: '500'
  },
  riskTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  riskTagText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  }
});
