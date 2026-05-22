import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

import { i18n } from "@/services/localization";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function EmergencyButton() {
  useLanguageStore((state) => state.locale);

  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.25, {
        duration: 1800,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: 1.4 - scale.value,
    };
  });

  const startHold = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCountdown(3);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          Linking.openURL("tel:911");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCountdown(null);
  };

  return (
    <View className="mt-4 items-center justify-center">
      <Animated.View
        style={animatedStyle}
        className="absolute h-56 w-56 rounded-full bg-red-400/20"
      />
      <Animated.View
        style={animatedStyle}
        className="absolute h-44 w-44 rounded-full bg-red-500/20"
      />

      <Pressable
        onPressIn={startHold}
        onPressOut={cancelHold}
        className="h-36 w-36 p-4 items-center justify-center rounded-full bg-red-600"
        style={{
          shadowColor: "#dc2626",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <Text className="text-lg font-bold text-white tracking-wide">
          {i18n.t("emergencyTitle")}
        </Text>

        <Text className="mt-2 text-center text-xs text-white px-3">
          {countdown
            ? i18n.t("callingIn", { count: countdown })
            : i18n.t("holdInstructions")}
        </Text>
      </Pressable>
    </View>
  );
}
