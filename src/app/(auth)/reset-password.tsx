import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { ChevronLeft, Lock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) {
        setError("Invalid or expired reset link.");
        return;
      }

      const hash = url.split("#")[1];
      if (!hash) {
        setError("Invalid or expired reset link.");
        return;
      }

      const params = Object.fromEntries(
        hash.split("&").map((pair) => {
          const [k, v] = pair.split("=");
          return [k, decodeURIComponent(v ?? "")];
        })
      );

      if (!params.access_token || !params.refresh_token) {
        setError("Invalid or expired reset link.");
        return;
      }

      supabase.auth
        .setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        })
        .then(({ error }) => {
          if (error) {
            setError("Invalid or expired reset link.");
          } else {
            setReady(true);
          }
        });
    });
  }, []);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <View className="px-4 py-4">
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-rubik-extrabold text-black-300">
            Reset Password
          </Text>
          <Text className="text-black-100 font-rubik mt-2 text-sm">
            Enter your new password below.
          </Text>
        </View>

        {!ready && !error ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" className="text-primary-300" />
            <Text className="text-black-100 font-rubik mt-4">
              Verifying reset link...
            </Text>
          </View>
        ) : error && !ready ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-6 items-center">
            <Text className="text-red-600 font-rubik-bold text-lg text-center">
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/forgot_password")}
              className="mt-4"
            >
              <Text className="text-primary-300 font-rubik-bold">
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-black-200 font-rubik-semibold mb-2 text-sm">
              New Password
            </Text>
            <View className="flex-row items-center bg-white border border-primary-200 rounded-xl px-4 py-3">
              <Lock size={20} color="#8C8E98" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                secureTextEntry
                className="flex-1 ml-3 font-rubik text-black-300"
              />
            </View>

            <Text className="text-black-200 font-rubik-semibold mb-2 mt-5 text-sm">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-white border border-primary-200 rounded-xl px-4 py-3">
              <Lock size={20} color="#8C8E98" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
                className="flex-1 ml-3 font-rubik text-black-300"
              />
            </View>

            {error ? (
              <Text className="text-red-500 text-sm mt-2 font-rubik">
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              className="bg-primary-300 py-4 rounded-xl items-center mt-8"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-rubik-bold">
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          className="items-center mt-6"
        >
          <Text className="text-primary-300 font-rubik-bold">Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
