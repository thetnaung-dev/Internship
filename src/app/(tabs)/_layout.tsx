// src/app/(tabs)/_layout.tsx
import { useLanguageStore } from "@/store/useLanguageStore";
import { Tabs } from "expo-router";
import {
    Dumbbell,
    House,
    MapPinned,
    MessageCircle,
    Pill,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { t } = useTranslation();
  const locale = useLanguageStore((state) => state.locale);

  return (
    <Tabs
      key={locale}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t("tabMap"),
          tabBarIcon: ({ color, size }) => (
            <MapPinned color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: t("tabMedicine"),
          tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: t("tabExercise"),
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabChat"),
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="place/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
