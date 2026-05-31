import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function AuthLayout() {
  return (
    <>
      {/* Forces a consistent status bar appearance across login/register screens */}
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          // Hides the default native header bar globally for all auth screens
          headerShown: false,

          // Background color behind screens during transitions
          contentStyle: { backgroundColor: "#f8fafc" }, // slate-50

          // Smooth slide animation on iOS and Android
          animation: "slide_from_right",
        }}
      >
        {/* Explicitly defining the screens makes route ordering clear */}
        <Stack.Screen
          name="login"
          options={{
            animationTypeForReplace: "pop", // Smooth transition when returning back
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            animationTypeForReplace: "pop",
          }}
        />
      </Stack>
    </>
  );
}
