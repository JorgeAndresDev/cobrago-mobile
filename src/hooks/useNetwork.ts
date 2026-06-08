import { useState, useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [wasOffline, setWasOffline] = useState(false);
  const prevConnected = useRef<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected;
      // If we were offline and now we're online, flag it
      if (prevConnected.current === false && connected === true) {
        setWasOffline(true);
      } else {
        setWasOffline(false);
      }
      prevConnected.current = connected;
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, wasOffline };
};
