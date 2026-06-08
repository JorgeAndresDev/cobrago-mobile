import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: any;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem = ({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton = () => (
  <View style={styles.cardSkeleton}>
    <View style={styles.row}>
      <SkeletonItem width={50} height={50} borderRadius={25} />
      <View style={styles.textStack}>
        <SkeletonItem width="60%" height={15} style={{ marginBottom: 8 }} />
        <SkeletonItem width="40%" height={10} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardSkeleton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  textStack: { marginLeft: 12, flex: 1 },
});
