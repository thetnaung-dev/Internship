import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
// 💡 Expo SDK ဗားရှင်းအသစ်အတွက် readAsStringAsync ကို legacy ကနေ ပြောင်းခေါ်ပြီး Error ရှင်းထားပါသည်
import { decode } from "base64-arraybuffer";
import { readAsStringAsync } from "expo-file-system/legacy";
import {
  ChevronDown,
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  Video,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

// ── GLUESTACK UI IMPORTS ───────────────────────────────────────────
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/features/ui/alertdialog/alertdialog";
import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";

interface SupabaseRegionRow {
  id: string | number;
  name_en: string;
  name_mm: string;
}

interface SupabaseTownshipRow {
  id: string | number;
  region_id: string | number;
  name_en: string;
  name_mm: string;
}

interface ApiDropdownItem {
  label: string;
  value: string;
}

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
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapSyncing, setIsMapSyncing] = useState(true);

  const [isRegionFocused, setIsRegionFocused] = useState(false);
  const [isTownshipFocused, setIsTownshipFocused] = useState(false);

  const [rawRegions, setRawRegions] = useState<SupabaseRegionRow[]>([]);
  const [rawTownships, setRawTownships] = useState<SupabaseTownshipRow[]>([]);

  const [showDimensions, setShowDimensions] = useState(false);
  const [showAreaBox, setShowAreaBox] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    showCancel: false,
    onConfirm: () => setIsAlertOpen(false),
  });

  const [formData, setFormData] = useState({
    titleMm: "",
    titleEn: "",
    propertyType: "",
    price: "",
    currencyUnit: "lakhs",
    floor: "",
    width: "",
    length: "",
    areaValue: "",
    areaUnit: "sqft",
    bedrooms: "0",
    bathrooms: "0",
    regionId: "",
    townshipId: "",
    phone: "",
    latitude: "",
    longitude: "",
  });

  const propertyTypes = [
    {
      label: t("dropdown_options.property_types.0.label", "Apartment"),
      value: "apartment",
    },
    {
      label: t("dropdown_options.property_types.1.label", "Condo"),
      value: "condo",
    },
    {
      label: t("dropdown_options.property_types.2.label", "House"),
      value: "house",
    },
    {
      label: t("dropdown_options.property_types.3.label", "Land"),
      value: "land",
    },
  ];

  const currencyUnits = [
    { label: "ကျပ် (သိန်း)", value: "lakhs" },
    { label: "USD", value: "usd" },
  ];

  const floorOptionsDataset = useMemo(
    () => [
      { label: t("ground floor") || "Ground Floor", value: "ground" },
      { label: t("ground + attic") || "Ground + Attic", value: "ground_attic" },
      { label: `${t("floor.st") || "Low Floor (1-4)"}`, value: "low" },
      { label: ` ${t("floor.nd") || "Middle Floor (5-8)"}`, value: "mid" },
      { label: ` ${t("floor.rd") || "High Floor (9+)"}`, value: "high" },
    ],
    [t],
  );

  const roomCountOptions = [
    { label: isBurmese ? "မပါ" : "None", value: "0" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5+", value: "5" },
  ];

  const areaUnitsDataset = [
    { label: isBurmese ? "စတုရန်းပေ" : "Sqft", value: "sqft" },
    { label: isBurmese ? "ဧက" : "Acre", value: "acre" },
  ];

  useEffect(() => {
    async function fetchMyanmarLocations() {
      try {
        setIsMapSyncing(true);
        const [regionsRes, townshipsRes] = await Promise.all([
          supabase
            .from("states_regions")
            .select("id, name_en, name_mm")
            .order("name_en", { ascending: true }),
          supabase
            .from("townships")
            .select("id, region_id, name_en, name_mm")
            .order("name_en", { ascending: true }),
        ]);

        if (regionsRes.error) throw regionsRes.error;
        if (townshipsRes.error) throw townshipsRes.error;

        setRawRegions(regionsRes.data || []);
        setRawTownships(townshipsRes.data || []);
      } catch (error: any) {
        setAlertConfig({
          title: t("error.databaseErrorTitle") || "Database Error",
          message: "Could not synchronize geolocation assets.",
          showCancel: false,
          onConfirm: () => setIsAlertOpen(false),
        });
        setIsAlertOpen(true);
      } finally {
        setIsMapSyncing(false);
      }
    }
    fetchMyanmarLocations();
  }, [t]);

  const regionOptions = useMemo<ApiDropdownItem[]>(() => {
    const formatted = rawRegions.map((item) => ({
      label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
      value: String(item.id).trim(),
    }));
    return [{ label: isBurmese ? "ပြည်နယ်နှင့်တိုင်းဒေသကြီးအားလုံး" : "All States & Regions", value: "" }, ...formatted];
  }, [rawRegions, isBurmese]);

  const activeTownships = useMemo<ApiDropdownItem[]>(() => {
    const subset = formData.regionId
      ? rawTownships.filter((twn) => String(twn.region_id).trim().toLowerCase() === String(formData.regionId).trim().toLowerCase())
      : rawTownships;
    const formatted = subset.map((item) => ({
      label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
      value: String(item.id).trim(),
    }));
    return [{ label: isBurmese ? "မြို့နယ်အားလုံး" : "All Townships", value: "" }, ...formatted];
  }, [rawTownships, formData.regionId, isBurmese]);

  useEffect(() => {
    const w = parseFloat(formData.width);
    const l = parseFloat(formData.length);
    if (!isNaN(w) && !isNaN(l)) {
      setShowAreaBox(true);
      const baseSqft = w * l;
      if (formData.areaUnit === "acre") {
        setFormData((prev) => ({
          ...prev,
          areaValue: String(Number((baseSqft / 43560).toFixed(4))),
        }));
      } else {
        setFormData((prev) => ({ ...prev, areaValue: String(baseSqft) }));
      }
    }
  }, [formData.width, formData.length, formData.areaUnit]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setCurrentStep(0);
        setIsLoading(false);
        setIsAlertOpen(false);
        setImages([]);
        setVideo(null);
      };
    }, []),
  );

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const showAlert = (
    title: string,
    message: string,
    customAction?: () => void,
    showCancel = false,
  ) => {
    setAlertConfig({
      title,
      message,
      showCancel,
      onConfirm: () => {
        setIsAlertOpen(false);
        if (customAction) customAction();
      },
    });
    setIsAlertOpen(true);
  };

  const pickImages = async () => {
    if (images.length >= 5) {
      showAlert(
        isBurmese ? "ကန့်သတ်ချက်ပြည့်ပြီ" : "Limit Reached",
        "You can only upload up to 5 images.",
      );
      return;
    }
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.6,
    });

    if (!result.canceled) {
      // 💡 (asset: any) ဟု ပြောင်းလဲသတ်မှတ်ခြင်းဖြင့် TypeScript 'implicitly has any type' error ကို ရှင်းလင်းထားပါသည်
      const selectedUris = result.assets.map((asset: any) => asset.uri);
      setImages((prev) => [...prev, ...selectedUris].slice(0, 5));
    }
  };

  const pickVideo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const videoAsset: any = result.assets[0];
      if (videoAsset.fileSize && videoAsset.fileSize > 300 * 1024 * 1024) {
        showAlert("Video Too Large", "Video file size must be under 300 MB.");
        return;
      }
      setVideo(videoAsset.uri);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── BACKEND LOGIC (FIXED DEPRECATION AND REDIRECTS TO HOME) ──
  const handleSubmitPost = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showAlert(
          t("alerts_and_dialogs.login_required.title") || "Login Required",
          t("alerts_and_dialogs.login_required.message") || "Please log in to continue.",
        );
        return;
      }

      // ၁။ ဓာတ်ပုံများကို property-media bucket သို့ တင်ခြင်း
      const uploadedImageUrls: string[] = [];
      for (const localUri of images) {
        const fileName = `${user.id}/img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;

        // 💡 legacy မဟုတ်သော readAsStringAsync သို့ ပြောင်းလဲအသုံးပြုထားပါသည်
        const base64 = await readAsStringAsync(localUri, {
          encoding: "base64",
        });

        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(fileName, decode(base64), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("property-media").getPublicUrl(fileName);
        uploadedImageUrls.push(publicUrl);
      }

      // ၂။ ဗီဒီယိုကို property-media bucket သို့ တင်ခြင်း
      let uploadedVideoUrl: string | null = null;
      if (video) {
        const videoName = `${user.id}/vid_${Date.now()}.mp4`;

        // 💡 legacy မဟုတ်သော readAsStringAsync သို့ ပြောင်းလဲအသုံးပြုထားပါသည်
        const base64Video = await readAsStringAsync(video, {
          encoding: "base64",
        });

        const { error: vidError } = await supabase.storage
          .from("property-media")
          .upload(videoName, decode(base64Video), {
            contentType: "video/mp4",
            upsert: true,
          });

        if (vidError) throw vidError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("property-media").getPublicUrl(videoName);
        uploadedVideoUrl = publicUrl;
      }

      const rawWidth = parseFloat(formData.width) || 0;
      const rawLength = parseFloat(formData.length) || 0;
      const computedSqft = rawWidth * rawLength;

      // ၃။ Database INSERT လုပ်ပြီး ad_number ကို ယူခြင်း
      const payload = {
        user_id: user.id,
        deal_type: dealType,
        property_type: formData.propertyType,
        price: parseFloat(formData.price),
        currency_unit: formData.currencyUnit,
        floor: ["apartment", "condo"].includes(formData.propertyType)
          ? formData.floor
          : null,
        width: formData.width ? parseFloat(formData.width) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        sqft:
          computedSqft ||
          (formData.areaUnit === "sqft"
            ? parseFloat(formData.areaValue)
            : null),
        area_value: formData.areaValue ? parseFloat(formData.areaValue) : null,
        area_unit: formData.areaUnit,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        state_region_id: formData.regionId || null,
        township_id: formData.townshipId || null,
        search_value: formData.phone,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        title_mm: formData.titleMm || null,
        title_en: formData.titleEn || null,
        images: uploadedImageUrls,
        video_url: uploadedVideoUrl,
      };

      const { data: insertedData, error } = await supabase
        .from("properties")
        .insert([payload])
        .select("ad_number")
        .single();

      if (error) throw error;

      const formattedAdNumber = `PROP-${10000 + (insertedData?.ad_number || 1)}`;

      // ၄။ အောင်မြင်စွာတင်ပြီးနောက် Home Screen သို့ လမ်းကြောင်းလွှဲပြောင်းပေးခြင်း
      showAlert(
        isBurmese ? "အောင်မြင်ပါသည်" : "Submission Successful",
        isBurmese
          ? `သင့်ကြော်ငြာအား အောင်မြင်စွာ တင်ပြီးပါပြီ။ ကြော်ငြာနံပါတ်မှာ ${formattedAdNumber} ဖြစ်ပါသည်။`
          : `Your listing is live. The Advertisement Number is ${formattedAdNumber}.`,
        () => {
          // Confirm နှိပ်လိုက်သည်နှင့် Home သို့ ရောက်ရှိသွားမည်ဖြစ်သည်
          router.replace("/(tabs)");
        },
        false,
      );
    } catch (err: any) {
      showAlert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMapSyncing) {
    return (
      <SafeAreaView className="flex-1 bg-primary-100 items-center justify-center">
        <ActivityIndicator size="small" className="text-primary-300" />
        <Text className="text-black-100 font-rubik-medium text-xs mt-2">
          Syncing Myanmar Map Registries...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      {/* INNER FORM HEADER */}
      <View className="bg-white border-b border-primary-200 px-4 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-black-300 font-rubik-bold text-base">
          {dealTitle} {t("form_headers.step_title_suffix") || "Listing"}
        </Text>
        <Text className="text-black-300 font-rubik-bold text-xs">
          {t("form_headers.step_indicator_prefix") || "Step"} {currentStep + 1}/3
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View className="w-full h-1 bg-primary-100">
        <View
          className="h-full bg-primary-300 rounded-full"
          style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
        {/* STEP 1 */}
        {currentStep === 0 && (
          <View className="gap-4">
              <Text className="text-black-300 font-rubik-bold text-base mb-2">
                {t("step_1.section_title") || "Property Information"}
              </Text>
            {isBurmese ? (
              <View className="gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {t("step_1.labels.title_mm") || "Title (Myanmar)"} *
                </Text>
                <TextInput
                  placeholder="ခေါင်းစဉ် ထည့်သွင်းပါ"
                  value={formData.titleMm}
                  onChangeText={(text) => handleInputChange("titleMm", text)}
                  style={styles.textInput}
                />
              </View>
            ) : (
              <View className="gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {t("step_1.labels.title_en") || "Title (English)"} *
                </Text>
                <TextInput
                  placeholder="Enter title in English"
                  value={formData.titleEn}
                  onChangeText={(text) => handleInputChange("titleEn", text)}
                  style={styles.textInput}
                />
              </View>
            )}

            <View className="gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {t("step_1.labels.property_type") || "Property Type"}
              </Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerDropdownStyle}
                data={propertyTypes}
                labelField="label"
                valueField="value"
                placeholder={t("step_1.placeholders.property_type_dropdown") || "Select Property Type"}
                value={formData.propertyType}
                renderRightIcon={() => (
                  <ChevronDown size={20} color="#64748b" />
                )}
                onChange={(item) => {
                  setFormData((prev) => ({
                    ...prev,
                    propertyType: item.value,
                    floor: ["apartment", "condo"].includes(item.value)
                      ? prev.floor
                      : "",
                  }));
                }}
              />
            </View>

            <View className="flex-row gap-3 w-full">
              <View className="flex-[5] gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {t("step_1.labels.price") || "Price"} *
                </Text>
                <TextInput
                  placeholder="500"
                  value={formData.price}
                  onChangeText={(t) => handleInputChange("price", t)}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
              <View className="flex-[4] gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {t("step_1.labels.currency") || "Currency"}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  data={currencyUnits}
                  labelField="label"
                  valueField="value"
                  value={formData.currencyUnit}
                  renderRightIcon={() => (
                    <ChevronDown size={20} color="#64748b" />
                  )}
                  onChange={(item) =>
                    handleInputChange("currencyUnit", item.value)
                  }
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 2 */}
        {currentStep === 1 && (
          <View className="gap-4">
              <Text className="text-black-300 font-rubik-bold text-base mb-2">
                {t("step_2.section_title") || "Property Details"}
              </Text>
            {["apartment", "condo"].includes(formData.propertyType) && (
              <View className="gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {t("step_2.labels.floor") || "Floor"} *
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  data={floorOptionsDataset}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Floor"
                  value={formData.floor}
                  renderRightIcon={() => (
                    <ChevronDown size={20} color="#64748b" />
                  )}
                  onChange={(item) => handleInputChange("floor", item.value)}
                />
              </View>
            )}

            <View className="flex-row items-center justify-between py-2 border-b border-primary-200">
              <Text className="text-black-200 font-rubik-bold text-sm">
                {isBurmese ? "အကျယ်အဝန်း" : "Property Size"}
              </Text>
              <View className="flex-row bg-primary-100 p-1 rounded-xl border border-primary-200 gap-1">
                <TouchableOpacity
                  onPress={() => setShowDimensions(!showDimensions)}
                  style={[
                    styles.toggleBtn,
                    showDimensions
                      ? styles.toggleBtnActive
                      : styles.toggleBtnNonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      showDimensions
                        ? styles.toggleBtnTextActive
                        : styles.toggleBtnTextNonActive,
                    ]}
                  >
                    Length x Width
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAreaBox(!showAreaBox)}
                  style={[
                    styles.toggleBtn,
                    showAreaBox
                      ? styles.toggleBtnActive
                      : styles.toggleBtnNonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      showAreaBox
                        ? styles.toggleBtnTextActive
                        : styles.toggleBtnTextNonActive,
                    ]}
                  >
                    Area
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDimensions && (
              <View className="flex-row gap-3 w-full">
                <View className="flex-1 gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {isBurmese ? "အနံ (ပေ) *" : "Width (ft) *"}
                  </Text>
                  <TextInput
                    placeholder="20"
                    value={formData.width}
                    onChangeText={(t) => handleInputChange("width", t)}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                <View className="flex-1 gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {isBurmese ? "အလျား (ပေ) *" : "Length (ft) *"}
                  </Text>
                  <TextInput
                    placeholder="60"
                    value={formData.length}
                    onChangeText={(t) => handleInputChange("length", t)}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
              </View>
            )}

            {showAreaBox && (
              <View className="gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {isBurmese ? "စုစုပေါင်း ဧရိယာ *" : "Total Area *"}
                </Text>
                <View className="flex-row gap-3 w-full">
                  <View className="flex-[5]">
                    <TextInput
                      placeholder="1200"
                      value={formData.areaValue}
                      onChangeText={(t) => handleInputChange("areaValue", t)}
                      keyboardType="numeric"
                      style={styles.textInput}
                    />
                  </View>
                  <View className="flex-[4]">
                    <Dropdown
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      containerStyle={styles.containerDropdownStyle}
                      data={areaUnitsDataset}
                      labelField="label"
                      valueField="value"
                      value={formData.areaUnit}
                      renderRightIcon={() => (
                        <ChevronDown size={20} color="#64748b" />
                      )}
                      onChange={(item) =>
                        handleInputChange("areaUnit", item.value)
                      }
                    />
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row gap-3 w-full">
              <View className="flex-1 gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {isBurmese ? "အိပ်ခန်း" : "Bedrooms"}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  data={roomCountOptions}
                  labelField="label"
                  valueField="value"
                  value={formData.bedrooms}
                  onChange={(item) => handleInputChange("bedrooms", item.value)}
                />
              </View>
              <View className="flex-1 gap-1.5">
                <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                  {isBurmese ? "ရေချိုးခန်း" : "Bathrooms"}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  data={roomCountOptions}
                  labelField="label"
                  valueField="value"
                  value={formData.bathrooms}
                  onChange={(item) =>
                    handleInputChange("bathrooms", item.value)
                  }
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 3 */}
        {currentStep === 2 && (
          <View className="gap-4">
              <Text className="text-black-300 font-rubik-bold text-base mb-2">
                {t("step_3.section_title") || "Location & Media"}
              </Text>
            <View>
              <TouchableOpacity
                onPress={async () => {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== "granted") return;
                  const loc = await Location.getCurrentPositionAsync({});
                  setFormData((prev) => ({
                    ...prev,
                    latitude: loc.coords.latitude.toString(),
                    longitude: loc.coords.longitude.toString(),
                  }));
                }}
                className="bg-blue-50 border border-blue-200 rounded-xl py-3 px-4 flex-row items-center gap-3"
              >
                <MapPin size={18} color="#3b82f6" />
                <Text className="text-blue-700 font-bold text-sm flex-1">
                  {formData.latitude ? (t("step_3.locationSet") || "Location set") : (t("step_3.setLocation") || "Set Location")}
                </Text>
                <MapPin size={18} color="#3b82f6" fill={formData.latitude ? "#3b82f6" : "transparent"} />
              </TouchableOpacity>
              {formData.latitude && (
                <View className="mt-2 rounded-xl overflow-hidden border border-primary-200" style={{ height: 140 }}>
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: parseFloat(formData.latitude),
                      longitude: parseFloat(formData.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(formData.latitude),
                        longitude: parseFloat(formData.longitude),
                      }}
                    />
                  </MapView>
                </View>
              )}
            </View>

            <View className="gap-1.5">
              <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                {t("step_3.labels.region") || "State / Region"}
              </Text>
              <Dropdown
                style={[styles.dropdown, isRegionFocused && styles.focusedBorder]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerDropdownStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="#dcfce7"
                data={regionOptions}
                labelField="label"
                valueField="value"
                placeholder={isBurmese ? "ပြည်နယ်နှင့်တိုင်းဒေသကြီးအားလုံး" : "All States & Regions"}
                value={formData.regionId}
                onFocus={() => setIsRegionFocused(true)}
                onBlur={() => setIsRegionFocused(false)}
                renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
                onChange={(item) =>
                  setFormData((prev) => ({
                    ...prev,
                    regionId: item.value,
                    townshipId: "",
                  }))
                }
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                {t("step_3.labels.township") || "Township"}
              </Text>
              <Dropdown
                style={[styles.dropdown, isTownshipFocused && styles.focusedBorder]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerDropdownStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="#dcfce7"
                data={activeTownships}
                labelField="label"
                valueField="value"
                placeholder={isBurmese ? "မြို့နယ်အားလုံး" : "All Townships"}
                value={formData.townshipId}
                onFocus={() => setIsTownshipFocused(true)}
                onBlur={() => setIsTownshipFocused(false)}
                renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
                onChange={(item) =>
                  setFormData((prev) => ({ ...prev, townshipId: item.value }))
                }
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-black-200 font-rubik-semibold text-xs px-1">
                {t("step_3.labels.phone") || "Phone Number"}
              </Text>
              <TextInput
                placeholder="09xxxxxxxxx"
                value={formData.phone}
                onChangeText={(t) => handleInputChange("phone", t)}
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>

            {/* MEDIA SECTION */}
            <View className="mt-4 border-t border-primary-100 pt-4 gap-4">
              <Text className="text-black-300 font-rubik-bold text-sm">
                {isBurmese
                  ? "မီဒီယာ ဖိုင်များ တင်ရန်"
                  : "Upload Media Resources"}
              </Text>
              <View className="gap-2">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-3"
                >
                  {images.map((uri, index) => (
                    <View
                      key={index}
                      className="relative w-20 h-20 rounded-xl overflow-hidden bg-primary-100"
                    >
                      <Image source={{ uri }} className="w-full h-full" />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black-300/60 p-1 rounded-full"
                      >
                        <X size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {images.length < 5 && (
                    <TouchableOpacity
                      onPress={pickImages}
                      style={styles.mediaPlaceholderBox}
                    >
                      <ImageIcon size={20} color="#22c55e" />
                      <Text style={styles.mediaPlaceholderText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              <View className="gap-2">
                {video ? (
                  <View className="bg-primary-100 border border-primary-200 rounded-xl p-3 flex-row items-center justify-between">
                    <Text
                      numberOfLines={1}
                      className="text-black-300 text-xs font-rubik-semibold flex-1"
                    >
                      {video.split("/").pop()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setVideo(null)}
                      className="bg-primary-200 p-1.5 rounded-full"
                    >
                      <X size={14} color="#666876" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickVideo}
                    className="border border-dashed border-primary-300 rounded-xl p-4 flex-row items-center justify-center gap-2 bg-white"
                  >
                    <Video size={20} color="#22c55e" />
                    <Text className="text-black-100 font-rubik-bold text-xs">
                      Select Video File
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="p-4 bg-white border-t border-primary-100 flex-row gap-3">
        {currentStep > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(currentStep - 1)}
            className="flex-1 bg-white border border-primary-200 py-4 rounded-xl items-center"
          >
            <Text className="text-black-200 font-rubik-bold">
              {t("footer_buttons.back") || "Back"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            if (currentStep < 2) {
              if (currentStep === 0) {
                const hasValidTitle = isBurmese
                  ? formData.titleMm.trim()
                  : formData.titleEn.trim();
                if (!hasValidTitle || !formData.propertyType || !formData.price)
                  return;
              }
              if (currentStep === 1) {
                if (!showDimensions && !showAreaBox) return;
              }
              setCurrentStep(currentStep + 1);
            } else {
              if (!formData.phone)
                return;
              showAlert(
                isBurmese ? "ကြော်ငြာတင်ရန် သေချာပါသလား။" : "Publish Listing?",
                isBurmese
                  ? "အချက်အလက်များဖြင့် ကြော်ငြာအား လွှင့်တင်ပါမည်။"
                  : "Are you sure you want to publish?",
                () => handleSubmitPost(),
                true,
              );
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-primary-300 py-4 rounded-xl items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-rubik-bold">
              {currentStep === 2
                ? t("footer_buttons.submit") || "Submit"
                : t("footer_buttons.next") || "Next"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* DIALOG BOX */}
      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-5 rounded-2xl bg-white max-w-[85%]">
          <AlertDialogHeader>
            <Heading size="md">{alertConfig.title}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-1 mb-4">
            <Text className="text-black-200 text-sm">
              {alertConfig.message}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="flex-row gap-3 justify-end">
            {alertConfig.showCancel && (
              <Button
                variant="outline"
                action="secondary"
                className="rounded-xl"
                onPress={() => setIsAlertOpen(false)}
              >
                <ButtonText>{isBurmese ? "မလုပ်တော့ပါ" : "Cancel"}</ButtonText>
              </Button>
            )}
            <Button
              variant="solid"
              action="primary"
              className="bg-primary-300 rounded-xl"
              onPress={alertConfig.onConfirm}
            >
              <ButtonText className="text-white">
                {isBurmese ? "သေချာပါသည်" : "Confirm"}
              </ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 54,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  textInput: {
    height: 54,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: 16,
  },
  focusedBorder: { borderColor: "#22c55e" },
  placeholderStyle: { fontSize: 16, color: "#8C8E98" },
  selectedTextStyle: { fontSize: 16, color: "#191D31" },
  containerDropdownStyle: {
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  itemTextStyle: { fontSize: 15, color: "#666876", textAlign: "left" },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  toggleBtnNonActive: { backgroundColor: "transparent" },
  toggleBtnActive: { backgroundColor: "#bbf7d0" },
  toggleBtnText: { fontSize: 13, fontWeight: "700" },
  toggleBtnTextNonActive: { color: "#666876" },
  toggleBtnTextActive: { color: "#191D31" },
  mediaPlaceholderBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  mediaPlaceholderText: { fontSize: 10, color: "#22c55e", fontWeight: "700" },
});
