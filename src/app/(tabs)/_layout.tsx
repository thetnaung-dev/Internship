import { Tabs, useFocusEffect } from "expo-router";
import {
  CirclePlus,
  Home,
  Map,
  MessageSquare,
  User,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [totalUnread, setTotalUnread] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const fetchUnread = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.rpc("get_total_unread_count", {
          p_user_id: user.id,
        });
        if (mounted) setTotalUnread(data ?? 0);
      };
      fetchUnread();
      return () => { mounted = false; };
    }, []),
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#8C8E98",

        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#bbf7d0",
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          paddingHorizontal: 10,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create_post"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <CirclePlus size={35} color={color} />,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <View>
              <MessageSquare size={22} color={color} />
              {totalUnread > 0 && (
                <View style={{
                  position: "absolute",
                  top: -4,
                  right: -8,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#ef4444",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: "800",
                  }}>
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
