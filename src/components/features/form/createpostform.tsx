import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
        Alert.alert(
          t("error.databaseErrorTitle") || "Database Error",
          t("error.databaseErrorMessage") ||
            "Could not synchronize geolocation assets.",
        );
        console.error("Supabase Query Error:", error.message);
      } finally {
        setIsMapSyncing(false);
      }
    }

    fetchMyanmarLocations();
  }, [t]);

  const regionOptions = useMemo<ApiDropdownItem[]>(() => {
    return rawRegions.map((item) => ({
      label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
      value: String(item.id).trim(),
    }));
  }, [rawRegions, isBurmese]);

  const activeTownships = useMemo<ApiDropdownItem[]>(() => {
    if (!formData.regionId) return [];
    const selectedRegionIdNormalized = String(formData.regionId)
      .trim()
      .toLowerCase();

    return rawTownships
      .filter((twn) => {
        if (twn.region_id === undefined || twn.region_id === null) return false;
        return (
          String(twn.region_id).trim().toLowerCase() ===
          selectedRegionIdNormalized
        );
      })
      .map((item) => ({
        label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
        value: String(item.id).trim(),
      }));
  }, [rawTownships, formData.regionId, isBurmese]);

  useEffect(() => {
    const w = parseFloat(formData.width);
    const l = parseFloat(formData.length);

    if (!isNaN(w) && !isNaN(l)) {
      setShowAreaBox(true);

      const baseSqft = w * l;
      if (formData.areaUnit === "acre") {
        const calculatedAcres = baseSqft / 43560;
        setFormData((prev) => ({
          ...prev,
          areaValue: String(Number(calculatedAcres.toFixed(4))),
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
        setIsRegionFocused(false);
        setIsTownshipFocused(false);
        setShowDimensions(false);
        setShowAreaBox(false);
        setFormData({
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
        });
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

  const handleSubmitPost = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showAlert(
          t("alerts_and_dialogs.login_required.title"),
          t("alerts_and_dialogs.login_required.message"),
        );
        return;
      }

      const rawWidth = parseFloat(formData.width) || 0;
      const rawLength = parseFloat(formData.length) || 0;
      const computedSqft = rawWidth * rawLength;

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
        title_mm: formData.titleMm || null,
        title_en: formData.titleEn || null,
      };

      const { error } = await supabase.from("properties").insert([payload]);
      if (error) throw error;

      showAlert(
        t("alerts_and_dialogs.submission_success.title"),
        t("alerts_and_dialogs.submission_success.message"),
        () => onBack(),
        false,
      );
    } catch (err: any) {
      showAlert(t("alerts_and_dialogs.submission_error.title"), err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMapSyncing) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="small" color="#f59e0b" />
        <Text className="text-slate-400 font-medium text-xs mt-2">
          Syncing Myanmar Map Registries...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* INNER FORM HEADER */}
      <View className="bg-amber-500 border-b border-slate-100 px-4 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>

        <Text className="text-slate-800 font-bold text-base">
          {dealTitle} {t("form_headers.step_title_suffix")}
        </Text>

        <Text className="text-slate-900 font-bold text-xs">
          {t("form_headers.step_indicator_prefix")} {currentStep + 1}/3
        </Text>
      </View>

      {/* PROGRESS BAR */}
      <View className="w-full h-1 bg-slate-100">
        <View
          className="h-full bg-slate-700 rounded-full"
          style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
        {/* STEP 1 */}
        {currentStep === 0 && (
          <View className="gap-4">
            <Text className="text-slate-800 font-bold text-base mb-2">
              {t("step_1.section_title")}
            </Text>

            {isBurmese ? (
              <View className="gap-1.5">
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {t("step_1.labels.title_mm", "Listing Title (Myanmar)")} *
                </Text>
                <TextInput
                  placeholder={
                    t("step_1.placeholders.title_mm") || "ခေါင်းစဉ် ထည့်သွင်းပါ"
                  }
                  value={formData.titleMm}
                  onChangeText={(text) => handleInputChange("titleMm", text)}
                  style={styles.textInput}
                />
              </View>
            ) : (
              <View className="gap-1.5">
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {t("step_1.labels.title_en", "Listing Title (English)")} *
                </Text>
                <TextInput
                  placeholder={
                    t("step_1.placeholders.title_en") ||
                    "Enter title in English"
                  }
                  value={formData.titleEn}
                  onChangeText={(text) => handleInputChange("titleEn", text)}
                  style={styles.textInput}
                />
              </View>
            )}

            <View className="gap-1.5">
              <Text className="text-slate-600 font-semibold text-xs px-1">
                {t("step_1.labels.property_type", "Property Type")}
              </Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerDropdownStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="#fef3c7"
                data={propertyTypes}
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder={t("step_1.placeholders.property_type_dropdown")}
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
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {t("step_1.labels.price", "Price")} *
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
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {t("step_1.labels.currency", "Currency")}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="#fef3c7"
                  data={currencyUnits}
                  maxHeight={150}
                  labelField="label"
                  valueField="value"
                  placeholder="ကျပ် (သိန်း)"
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
            <Text className="text-slate-800 font-bold text-base mb-2">
              {t("step_2.section_title", "Property Details")}
            </Text>

            {["apartment", "condo"].includes(formData.propertyType) && (
              <View className="gap-1.5">
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {t("step_2.labels.floor", "Floor / Level")} *
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="#fef3c7"
                  data={floorOptionsDataset}
                  maxHeight={250}
                  labelField="label"
                  valueField="value"
                  placeholder={t("filter.floor") || "Select Floor"}
                  value={formData.floor}
                  renderRightIcon={() => (
                    <ChevronDown size={20} color="#64748b" />
                  )}
                  onChange={(item) => handleInputChange("floor", item.value)}
                />
              </View>
            )}

            {/* ADJUSTED SELECTION CONTROLS FOR VISIBILITY */}
            <View className="flex-row items-center justify-between py-2 border-b border-slate-100">
              <Text className="text-slate-700 font-bold text-sm">
                {isBurmese ? "အကျယ်အဝန်း" : "Property Size"}
              </Text>

              <View className="flex-row bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
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

            {/* DIMENSIONS VIEW */}
            {showDimensions && (
              <View className="flex-row gap-3 w-full animate-fadeIn">
                <View className="flex-1 gap-1.5">
                  <Text className="text-slate-600 font-semibold text-xs px-1">
                    {isBurmese ? "အကျယ် - အနံ (ပေ) *" : "Width (ft) *"}
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
                  <Text className="text-slate-600 font-semibold text-xs px-1">
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

            {/* DUAL UNIT AREA VIEW */}
            {showAreaBox && (
              <View className="gap-1.5 animate-fadeIn">
                <Text className="text-slate-600 font-semibold text-xs px-1">
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
                      itemTextStyle={styles.itemTextStyle}
                      activeColor="#fef3c7"
                      data={areaUnitsDataset}
                      maxHeight={120}
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

            {/* SPLIT DROPDOWN LIST ROW */}
            <View className="flex-row gap-3 w-full">
              <View className="flex-1 gap-1.5">
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {isBurmese ? "အိပ်ခန်း" : "Bedrooms"}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="#fef3c7"
                  data={roomCountOptions}
                  maxHeight={200}
                  labelField="label"
                  valueField="value"
                  value={formData.bedrooms}
                  renderRightIcon={() => (
                    <ChevronDown size={20} color="#64748b" />
                  )}
                  onChange={(item) => handleInputChange("bedrooms", item.value)}
                />
              </View>

              <View className="flex-1 gap-1.5">
                <Text className="text-slate-600 font-semibold text-xs px-1">
                  {isBurmese ? "ရေချိုးခန်း" : "Bathrooms"}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.containerDropdownStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="#fef3c7"
                  data={roomCountOptions}
                  maxHeight={200}
                  labelField="label"
                  valueField="value"
                  value={formData.bathrooms}
                  renderRightIcon={() => (
                    <ChevronDown size={20} color="#64748b" />
                  )}
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
            <Text className="text-slate-800 font-bold text-base mb-2">
              {t("step_3.section_title")}
            </Text>

            <View className="gap-1.5">
              <Text className="text-slate-600 font-semibold text-xs px-1">
                {t("step_3.labels.region", "State / Region")}
              </Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  isRegionFocused && styles.focusedBorder,
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerDropdownStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="#fef3c7"
                data={regionOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={t("filter.stateRegion") || "Select State/Region"}
                value={formData.regionId}
                onFocus={() => setIsRegionFocused(true)}
                onBlur={() => setIsRegionFocused(false)}
                renderRightIcon={() => (
                  <ChevronDown size={20} color="#64748b" />
                )}
                onChange={(item) => {
                  setFormData((prev) => ({
                    ...prev,
                    regionId: item.value,
                    townshipId: "",
                  }));
                  setIsRegionFocused(false);
                }}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-slate-600 font-semibold text-xs px-1">
                {t("step_3.labels.township", "Township")}
              </Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  isTownshipFocused && styles.focusedBorder,
                  !formData.regionId && { backgroundColor: "#f1f5f9" },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerDropdownStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="#fef3c7"
                data={activeTownships}
                maxHeight={300}
                labelField="label"
                valueField="value"
                disable={!formData.regionId}
                placeholder={
                  formData.regionId
                    ? t("filter.township") || "Select Township"
                    : "Choose region first"
                }
                value={formData.townshipId}
                onFocus={() => setIsTownshipFocused(true)}
                onBlur={() => setIsTownshipFocused(false)}
                renderRightIcon={() => (
                  <ChevronDown size={20} color="#64748b" />
                )}
                onChange={(item) => {
                  setFormData((prev) => ({ ...prev, townshipId: item.value }));
                  setIsTownshipFocused(false);
                }}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-slate-600 font-semibold text-xs px-1">
                {t("step_3.labels.phone", "Contact Phone Number")}
              </Text>
              <TextInput
                placeholder={t("step_3.placeholders.phone")}
                value={formData.phone}
                onChangeText={(t) => handleInputChange("phone", t)}
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>
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
            <Text className="text-slate-600 font-bold">
              {t("footer_buttons.back")}
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
                if (
                  !hasValidTitle ||
                  !formData.propertyType ||
                  !formData.price
                ) {
                  showAlert(
                    t(
                      "alerts_and_dialogs.step_0_validation.title",
                      "Required Fields Missing",
                    ),
                    t(
                      "alerts_and_dialogs.step_0_validation.message",
                      "Please complete all mandatory fields.",
                    ),
                  );
                  return;
                }
              }
              if (currentStep === 1) {
                if (!showDimensions && !showAreaBox) {
                  showAlert(
                    isBurmese ? "ရွေးချယ်ရန် လိုအပ်သည်" : "Selection Required",
                    isBurmese
                      ? "ကျေးဇူးပြု၍ အကျယ်အဝန်း ပုံစံတစ်ခု ရွေးချယ်ပါ"
                      : "Please select either Length x Width or Area input configurations.",
                  );
                  return;
                }
                if (showDimensions && (!formData.width || !formData.length)) {
                  showAlert(
                    isBurmese ? "အချက်အလက် လိုအပ်ချက်" : "Dimensions Required",
                    isBurmese
                      ? "အနံနှင့် အလျားကို ဖြည့်စွက်ပေးပါ"
                      : "Please input both width and length properties.",
                  );
                  return;
                }
                if (showAreaBox && !formData.areaValue) {
                  showAlert(
                    isBurmese ? "ဧရိယာ လိုအပ်သည်" : "Area Metric Missing",
                    isBurmese
                      ? "စုစုပေါင်းဧရိယာကို ဖြည့်စွက်ပေးပါ"
                      : "Please specify a valid total area configuration.",
                  );
                  return;
                }
                if (
                  ["apartment", "condo"].includes(formData.propertyType) &&
                  !formData.floor
                ) {
                  showAlert(
                    isBurmese
                      ? "ထပ်ခိုး/အလွှာ လိုအပ်သည်"
                      : "Floor Level Required",
                    isBurmese
                      ? "အလွှာနံပါတ်ကို ရွေးချယ်ပေးပါ"
                      : "Please select a floor tier level.",
                  );
                  return;
                }
              }
              setCurrentStep(currentStep + 1);
            } else {
              if (
                !formData.regionId ||
                !formData.townshipId ||
                !formData.phone
              ) {
                showAlert(
                  t("alerts_and_dialogs.step_2_validation.title"),
                  t("alerts_and_dialogs.step_2_validation.message"),
                );
                return;
              }

              showAlert(
                isBurmese
                  ? "ကြော်ငြာတင်ရန် သေချာပါသလား၊"
                  : "Publish Property Listing?",
                isBurmese
                  ? "သင်ဖြည့်စွက်ထားသော အချက်အလက်များဖြင့် ကြော်ငြာအား လွှင့်တင်ပါမည်။"
                  : "Are you sure you want to finalize and publish this real estate listing?",
                () => handleSubmitPost(),
                true,
              );
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-amber-500 py-4 rounded-xl items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">
              {currentStep === 2
                ? t("footer_buttons.submit")
                : t("footer_buttons.next")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* DYNAMIC GLUESTACK UI DIALOG MARKUP */}
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
          <AlertDialogFooter className="border-t-0 p-0 flex-row gap-3 justify-end">
            {alertConfig.showCancel && (
              <Button
                variant="outline"
                action="secondary"
                size="sm"
                className="border-slate-200 rounded-xl px-5 py-2.5"
                onPress={() => setIsAlertOpen(false)}
              >
                <ButtonText className="text-slate-500 font-semibold text-sm">
                  {isBurmese ? "မလုပ်တော့ပါ" : "Cancel"}
                </ButtonText>
              </Button>
            )}

            <Button
              variant="solid"
              action="primary"
              size="sm"
              className="bg-amber-500 rounded-xl px-5 py-2.5"
              onPress={alertConfig.onConfirm}
            >
              <ButtonText className="text-white font-semibold text-sm">
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
  focusedBorder: {
    borderColor: "#f59e0b",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "left",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
    textAlign: "left",
  },
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
  itemTextStyle: {
    fontSize: 15,
    color: "#334155",
    textAlign: "left",
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleBtnNonActive: {
    backgroundColor: "transparent",
  },
  toggleBtnActive: {
    backgroundColor: "#334155", // High-visibility dark slate color for active selections
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleBtnTextNonActive: {
    color: "#64748b",
  },
  toggleBtnTextActive: {
    color: "#ffffff", // Pure white text makes it highly visible when selected
  },
});
