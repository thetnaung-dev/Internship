// ── components/AdsSearchForm.tsx ─────────────────────────────────
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AdsSearchForm() {
  const { t } = useTranslation();
  const [adsSearchMethod, setAdsSearchMethod] = useState("id");
  const [searchValue, setSearchValue] = useState("");

  // DROPDOWN SELECTION STATE
  const [dropdowns, setDropdowns] = useState({
    stateRegion: "",
    township: "",
  });

  const handleSelectDropdown = (key: keyof typeof dropdowns, value: string) => {
    setDropdowns((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdsSearchSubmit = () => {
    const payload = {
      method: adsSearchMethod,
      queryValue: searchValue,
      ...dropdowns,
    };
    console.log("Submitting Ads Search Lookup: ", payload);
  };

  return (
    <View className="gap-5">
      {/* LINE 1: SELECTION OPTIONS FOR ADS SEARCH */}
      <View className="flex-row gap-6 items-center py-1">
        <TouchableOpacity
          onPress={() => setAdsSearchMethod("id")}
          className="flex-row items-center gap-2"
        >
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${adsSearchMethod === "id" ? "border-slate-600" : "border-slate-600"}`}
          >
            {adsSearchMethod === "id" && (
              <View className="w-2.5 h-2.5 bg-slate-950 rounded-full" />
            )}
          </View>
          <Text className="text-slate-800 font-bold text-sm">
            {t("adsFilter.byIdNumber")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAdsSearchMethod("phone")}
          className="flex-row items-center gap-2"
        >
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${adsSearchMethod === "phone" ? "border-slate-600" : "border-slate-600"}`}
          >
            {adsSearchMethod === "phone" && (
              <View className="w-2.5 h-2.5 bg-slate-950 rounded-full" />
            )}
          </View>
          <Text className="text-slate-800 font-bold text-sm">
            {t("adsFilter.byPhoneNumber")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LINE 2: PLAIN TEXT BOX INPUT CODE */}
      <View className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm shadow-slate-100">
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder={t("adsFilter.placeholder")}
          keyboardType="numeric"
          className="w-full text-slate-800 font-medium text-base text-left"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* LINE 3: REGIONAL SCOPE FILTER DROP-DOWNS */}
      <TouchableOpacity
        onPress={() => handleSelectDropdown("stateRegion", "Mandalay")}
        className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm flex-row justify-between items-center"
      >
        <Text
          className={`font-semibold text-base ${dropdowns.stateRegion ? "text-slate-800" : "text-slate-400"}`}
        >
          {dropdowns.stateRegion || t("adsFilter.stateRegion")}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      {/* LINE 4: TOWNSHIP SCOPE FILTER DROP-DOWNS */}
      <TouchableOpacity
        onPress={() => handleSelectDropdown("township", "Chanayethazan")}
        className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm flex-row justify-between items-center"
      >
        <Text
          className={`font-semibold text-base ${dropdowns.township ? "text-slate-800" : "text-slate-400"}`}
        >
          {dropdowns.township || t("adsFilter.township")}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      {/* BOTTOM FORM MASTER ACTION SUBMIT BUTTON */}
      <TouchableOpacity
        onPress={handleAdsSearchSubmit}
        className="bg-slate-950 w-full py-4 rounded-xl items-center justify-center shadow-md active:opacity-90 mt-2"
      >
        <Text className="text-white font-bold text-lg">
          {t("adsFilter.searchButton")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
