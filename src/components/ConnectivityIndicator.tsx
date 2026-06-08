import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useNetwork } from "../hooks/useNetwork";
import { useTheme } from "../context/ThemeContext";
import { syncService } from "../services/syncService";

type ConnStatus = "online" | "offline" | "syncing";

export default function ConnectivityIndicator() {
  const { isConnected } = useNetwork();
  const { colors } = useTheme();
  const [status, setStatus] = useState<ConnStatus>("online");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulse animation for the dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const showBanner = (s: ConnStatus) => {
    setStatus(s);
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    if (s !== "offline") {
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
          setVisible(false);
        });
      }, 3000);
    }
  };

  useEffect(() => {
    if (isConnected === false) {
      showBanner("offline");
    } else if (isConnected === true) {
      // Brief "syncing" flash
      showBanner("syncing");
      syncService.syncAll().then(() => {
        showBanner("online");
      });
    }
  }, [isConnected]);

  if (!visible) return null;

  const config = {
    online: { color: "#4ade80", bg: "rgba(74, 222, 128, 0.12)", label: "Conectado" },
    offline: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", label: "Sin conexión" },
    syncing: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", label: "Sincronizando..." },
  }[status];

  return (
    <Animated.View style={[styles.banner, { backgroundColor: config.bg, opacity }]}>
      <View style={styles.inner}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: config.color, transform: [{ scale: status === "syncing" ? pulse : 1 }] },
          ]}
        />
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: 48,
    paddingBottom: 10,
    alignItems: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
