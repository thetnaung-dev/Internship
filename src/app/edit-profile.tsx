import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { ChevronLeft, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let finalAvatarUrl = avatarUrl;

      if (avatarUrl && !avatarUrl.startsWith("http")) {
        const ext = avatarUrl.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        const filePath = `${user.id}/avatar.${ext}`;

        const file = new File(avatarUrl);
        const arrayBuffer = await file.arrayBuffer();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: mimeType,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);
        finalAvatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), avatar_url: finalAvatarUrl })
        .eq("id", user.id);

      if (error) throw error;
      router.back();
    } catch (err) {
      console.error("Error saving profile:", err);
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 mr-6">
          Edit Profile
        </Text>
      </View>

      <View className="flex-1 px-6 pt-8">
        <TouchableOpacity
          onPress={pickImage}
          className="self-center mb-10 items-center"
        >
          <View className="w-28 h-28 rounded-full bg-slate-200 items-center justify-center overflow-hidden border-4 border-amber-200">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <User size={44} color="#94a3b8" />
            )}
          </View>
          <Text className="text-amber-500 font-semibold text-sm mt-3">
            Change Photo
          </Text>
        </TouchableOpacity>

        <Text className="text-slate-500 text-xs font-bold mb-1.5 uppercase tracking-wider">
          Username
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your name"
          placeholderTextColor="#94a3b8"
          className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-base mb-8"
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !fullName.trim()}
          className={`rounded-xl px-5 py-2.5 items-center justify-center ${saving || !fullName.trim() ? "bg-amber-300" : "bg-amber-500"}`}
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold text-sm">
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>

      <AlertDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        useRNModal={true}
      >
        <AlertDialog.Backdrop />
        <AlertDialog.Content className="p-6 rounded-3xl bg-white w-5/6 items-center shadow-xl">
          <AlertDialog.Header>
            <Heading>Error</Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <Text className="text-center text-slate-500">
              Failed to save profile. Please try again.
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer className="w-full flex-row justify-center">
            <Button
              onPress={() => setShowError(false)}
              className="flex-1"
            >
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </SafeAreaView>
  );
}
