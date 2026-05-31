import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

// ── GLUESTACK UI IMPORTS ───────────────────────────────────────────
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/features/ui/alertdialog/alertdialog"; // Adjust this import path depending on your project configuration
import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";

interface CreatePostFormProps {
  dealType: string;
  dealTitle: string;
  onBack: () => void;
}

export default function CreatePostForm({
  dealType,
  dealTitle,
  onBack,
}: CreatePostFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── ALERT DIALOG STATES ──────────────────────────────────────────
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => setIsAlertOpen(false),
  });

  // Form States
  const [formData, setFormData] = useState({
    titleMm: "",
    titleEn: "",
    propertyType: "",
    price: "",
    floor: "",
    rooms: "",
    sqft: "",
    regionId: "",
    townshipId: "",
    phone: "",
  });

  // Reset form states when user leaves screen context
  useFocusEffect(
    useCallback(() => {
      return () => {
        setCurrentStep(0);
        setIsLoading(false);
        setIsAlertOpen(false);
        setFormData({
          titleMm: "",
          titleEn: "",
          propertyType: "",
          price: "",
          floor: "",
          rooms: "",
          sqft: "",
          regionId: "",
          townshipId: "",
          phone: "",
        });
      };
    }, []),
  );

  const propertyTypes = [
    { label: "တိုက်ခန်း (Apartment)", value: "apartment" },
    { label: "ကွန်ဒို (Condo)", value: "condo" },
    { label: "လုံးချင်းအိမ် (House)", value: "house" },
    { label: "မြေကွက် (Land)", value: "land" },
  ];

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Helper trigger function to mimic functional native alerts cleanly
  const showAlert = (
    title: string,
    message: string,
    customAction?: () => void,
  ) => {
    setAlertConfig({
      title,
      message,
      onConfirm: () => {
        setIsAlertOpen(false);
        if (customAction) customAction();
      },
    });
    setIsAlertOpen(true);
  };

  const handleSubmitPost = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showAlert("သတိပေးချက်", "ပို့စ်တင်ရန်အတွက် ဦးစွာ Login ဝင်ပေးပါရန်။");
        return;
      }

      const payload = {
        user_id: user.id,
        deal_type: dealType,
        property_type: formData.propertyType,
        price: parseFloat(formData.price),
        floor: formData.floor || null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        sqft: formData.sqft ? parseFloat(formData.sqft) : null,
        state_region_id: formData.regionId || null,
        township_id: formData.townshipId || null,
        search_value: formData.phone,
      };

      const { error } = await supabase.from("properties").insert([payload]);
      if (error) throw error;

      showAlert(
        "အောင်မြင်ပါသည်",
        "သင်၏ ကြော်ငြာကို အောင်မြင်စွာ တင်ပြီးပါပြီ။",
        () => onBack(),
      );
    } catch (err: any) {
      showAlert("မှားယွင်းမှု", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* INNER FORM HEADER */}
      <View className="bg-white border-b border-slate-100 px-4 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>

        <Text className="text-slate-800 font-bold text-base">
          {dealTitle} ဖြည့်စွက်ရန်
        </Text>

        <Text className="text-amber-500 font-bold text-xs">
          Step {currentStep + 1}/3
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View className="w-full h-1 bg-slate-100">
        <View
          className="h-full bg-amber-500"
          style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
        {/* STEP 1 */}
        {currentStep === 0 && (
          <View className="gap-4">
            <Text className="text-slate-800 font-bold text-base mb-2">
              အခြေခံအချက်အလက်များ
            </Text>
            <TextInput
              placeholder="ကြော်ငြာခေါင်းစဉ် (Myanmar) *"
              value={formData.titleMm}
              onChangeText={(t) => handleInputChange("titleMm", t)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
            <Dropdown
              data={propertyTypes}
              labelField="label"
              valueField="value"
              value={formData.propertyType}
              onChange={(item) => handleInputChange("propertyType", item.value)}
              placeholder="အိမ်ခြံမြေ အမျိုးအစား ရွေးချယ်ပါ *"
              style={{
                backgroundColor: "white",
                padding: 12,
                borderRadius: 12,
                borderColor: "#e2e8f0",
                borderWidth: 1,
              }}
            />
            <TextInput
              placeholder={
                dealType === "rent" ||
                dealType === "hostel" ||
                dealType === "want_to_rent"
                  ? "လစဉ်ငှားရမ်းခ (သိန်း) *"
                  : "ရောင်းဈေး/ဝယ်လိုဈေး (သိန်း) *"
              }
              value={formData.price}
              onChangeText={(t) => handleInputChange("price", t)}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
          </View>
        )}

        {/* STEP 2 */}
        {currentStep === 1 && (
          <View className="gap-4">
            <Text className="text-slate-800 font-bold text-base mb-2">
              အသေးစိတ် အချက်အလက်များ
            </Text>
            <TextInput
              placeholder="အလွှာ (Floor)"
              value={formData.floor}
              onChangeText={(t) => handleInputChange("floor", t)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
            <TextInput
              placeholder="အခန်းအရေအတွက်"
              value={formData.rooms}
              onChangeText={(t) => handleInputChange("rooms", t)}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
            <TextInput
              placeholder="အကျယ်အဝန်း (Sqft)"
              value={formData.sqft}
              onChangeText={(t) => handleInputChange("sqft", t)}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
          </View>
        )}

        {/* STEP 3 */}
        {currentStep === 2 && (
          <View className="gap-4">
            <Text className="text-slate-800 font-bold text-base mb-2">
              တည်နေရာနှင့် ဆက်သွယ်ရန်
            </Text>
            <TextInput
              placeholder="တိုင်းဒေသကြီး / ပြည်နယ် *"
              value={formData.regionId}
              onChangeText={(t) => handleInputChange("regionId", t)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
            <TextInput
              placeholder="မြို့နယ် *"
              value={formData.townshipId}
              onChangeText={(t) => handleInputChange("townshipId", t)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
            <TextInput
              placeholder="ဆက်သွယ်ရန် ဖုန်းနံပါတ် *"
              value={formData.phone}
              onChangeText={(t) => handleInputChange("phone", t)}
              keyboardType="phone-pad"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700"
            />
          </View>
        )}
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="p-4 bg-white border-t border-slate-100 flex-row gap-3">
        {currentStep > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(currentStep - 1)}
            className="flex-1 bg-slate-100 py-4 rounded-xl items-center"
          >
            <Text className="text-slate-600 font-bold">နောက်သို့</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            if (currentStep < 2) {
              if (
                currentStep === 0 &&
                (!formData.titleMm || !formData.propertyType || !formData.price)
              ) {
                showAlert(
                  "သတိပေးချက်",
                  "လိုအပ်သော အချက်အလက်များကို ဖြည့်စွက်ပေးပါ။",
                );
                return;
              }
              setCurrentStep(currentStep + 1);
            } else {
              if (
                !formData.regionId ||
                !formData.townshipId ||
                !formData.phone
              ) {
                showAlert(
                  "သတိပေးချက်",
                  "တည်နေရာနှင့် ဆက်သွယ်ရန် ဖုန်းနံပါတ် ဖြည့်စွက်ပေးပါ။",
                );
                return;
              }
              handleSubmitPost();
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-amber-500 py-4 rounded-xl items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">
              {currentStep === 2 ? "ကြော်ငြာတင်မည်" : "ရှေ့သို့"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── GLUESTACK UI DIALOG MARKUP ────────────────────────────── */}
      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-5 rounded-2xl bg-white max-w-[85%]">
          <AlertDialogHeader className="border-b-0 pb-2">
            <Heading
              size="md"
              className="text-slate-900 font-bold text-lg text-left"
            >
              {alertConfig.title}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-1 mb-4">
            <Text className="text-slate-600 text-sm leading-relaxed text-left">
              {alertConfig.message}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="border-t-0 p-0 flex-row justify-end">
            <Button
              variant="solid"
              action="primary"
              size="sm"
              className="bg-amber-500 rounded-xl px-5 py-2.5"
              onPress={alertConfig.onConfirm}
            >
              <ButtonText className="text-white font-semibold text-sm">
                ကောင်းပြီ
              </ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
