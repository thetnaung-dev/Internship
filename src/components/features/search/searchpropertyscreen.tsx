// ── components/PropertySearchForm.tsx ─────────────────────────────
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

// Make sure this points to your project's shared Supabase initialization client file
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";

interface SupabaseRegionRow {
  id: string;
  name_en: string;
  name_mm: string;
}

interface SupabaseTownshipRow {
  id: string;
  region_id: string;
  name_en: string;
  name_mm: string;
}

interface ApiDropdownItem {
  label: string;
  value: string;
}

export default function PropertySearchForm() {
  const { t, i18n } = useTranslation();

  // Determine if the current language setting is Burmese
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  // ── APP CONTROLLER STATES ─────────────────────────────────────────
  const [dealType, setDealType] = useState("sale");
  const [agentType, setAgentType] = useState("all");
  const [textSearch, setTextSearch] = useState("");

  // Keep raw database values untouched in state caches
  const [rawRegions, setRawRegions] = useState<SupabaseRegionRow[]>([]);
  const [rawTownships, setRawTownships] = useState<SupabaseTownshipRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isRegionFocused, setIsRegionFocused] = useState(false);
  const [isTownshipFocused, setIsTownshipFocused] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    stateRegion: "",
    township: "",
    propertyType: "",
    floor: "", // ✅ Floor အတွက် State အသစ် ထည့်သွင်းထားပါတယ်
    minPrice: "",
    maxPrice: "",
    rooms: "",
    sqft: "",
  });

  // ── RESET FORM STATE ON SCREEN BLUR / LEAVE ──────────────────────
  useFocusEffect(
    useCallback(() => {
      return () => {
        setDealType("sale");
        setAgentType("all");
        setTextSearch("");
        setDropdowns({
          stateRegion: "",
          township: "",
          propertyType: "",
          floor: "", // ✅ Reset လုပ်တဲ့အထဲမှာ ထည့်သွင်းထားပါတယ်
          minPrice: "",
          maxPrice: "",
          rooms: "",
          sqft: "",
        });
        setIsRegionFocused(false);
        setIsTownshipFocused(false);
      };
    }, []),
  );

  useEffect(() => {
    async function fetchMyanmarLocations() {
      try {
        setIsLoading(true);

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
        setIsLoading(false);
      }
    }

    fetchMyanmarLocations();
  }, [t]);

  const regionsPool = useMemo<ApiDropdownItem[]>(() => {
    const formatted = rawRegions.map((item) => ({
      label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
      value: item.id,
    }));

    return [
      {
        label: t("filter.allRegions") || "တိုင်းဒေသကြီးနှင့်ပြည်နယ်အားလုံး",
        value: "",
      },
      ...formatted,
    ];
  }, [rawRegions, isBurmese, t]);

  const filteredTownships = useMemo<ApiDropdownItem[]>(() => {
    const subset = dropdowns.stateRegion
      ? rawTownships.filter((twn) => twn.region_id === dropdowns.stateRegion)
      : rawTownships;

    const formatted = subset.map((item) => ({
      label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
      value: item.id,
    }));

    return [
      {
        label: t("filter.allTownships") || "မြို့နယ်အားလုံး",
        value: "",
      },
      ...formatted,
    ];
  }, [rawTownships, dropdowns.stateRegion, isBurmese, t]);

  const handleSelectDropdown = (key: keyof typeof dropdowns, value: string) => {
    setDropdowns((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchSubmit = () => {
    const payload = {
      dealType,
      textSearch,
      agentType,
      ...dropdowns,
    };
    console.log("Submitting Active Property Query Parameters: ", payload);
    console.log("================ FORM DATA EXTRACTED ================");
    console.log(JSON.stringify(payload, null, 2));
    console.log("=====================================================");
  };

  if (isLoading) {
    return (
      <View className="py-12 items-center justify-center">
        <ActivityIndicator size="small" color="#f59e0b" />
        <Text className="text-slate-400 font-medium text-xs mt-2">
          Syncing Myanmar Map Registries...
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-5">
      {/* 1. DEAL TYPE TOGGLES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row py-1"
      >
        <View className="flex-row gap-5 items-center pr-6">
          {(["sale", "rent", "launch", "building"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setDealType(type)}
              className="flex-row items-center gap-2"
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  dealType === type ? "border-slate-600" : "border-slate-300"
                }`}
              >
                {dealType === type && (
                  <View className="w-2.5 h-2.5 bg-slate-950 rounded-full" />
                )}
              </View>
              <Text className="text-slate-800 font-bold text-sm">
                {type === "sale" && (t("filter.forSale") || "For Sale")}
                {type === "rent" && (t("filter.forRent") || "For Rent")}
                {type === "launch" && (t("filter.newLaunch") || "New Launch")}
                {type === "building" && (t("filter.building") || "Building")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 4. STATE / REGION DROPDOWN */}
      <View>
        <Dropdown
          style={[styles.dropdown, isRegionFocused && styles.focusedBorder]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#fef3c7"
          data={regionsPool}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={t("filter.stateRegion") || "Select State/Region"}
          value={dropdowns.stateRegion}
          onFocus={() => setIsRegionFocused(true)}
          onBlur={() => setIsRegionFocused(false)}
          renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
          onChange={(item) => {
            setDropdowns((prev) => ({
              ...prev,
              stateRegion: item.value,
              township: "",
            }));
            setIsRegionFocused(false);
          }}
        />
      </View>

      {/* 5. TOWNSHIP DROPDOWN */}
      <View>
        <Dropdown
          style={[styles.dropdown, isTownshipFocused && styles.focusedBorder]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#fef3c7"
          data={filteredTownships}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={t("filter.township") || "Select Township"}
          value={dropdowns.township}
          onFocus={() => setIsTownshipFocused(true)}
          onBlur={() => setIsTownshipFocused(false)}
          renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
          onChange={(item) => {
            handleSelectDropdown("township", item.value);
            setIsTownshipFocused(false);
          }}
        />
      </View>

      {/* 6. PROPERTY SELECTION MATRICES */}
      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#fef3c7"
          data={[
            {
              label: t("filter.allProperties") || "All Property Types",
              value: "",
            },
            { label: t("property.condo") || "Condominium", value: "condo" },
            {
              label: t("property.apartment") || "Apartment",
              value: "apartment",
            },
            { label: t("property.house") || "House / Villa", value: "house" },
            { label: t("property.land") || "Land", value: "land" },
          ]}
          maxHeight={250}
          labelField="label"
          valueField="value"
          placeholder={t("filter.propertyType") || "Property Type"}
          value={dropdowns.propertyType}
          renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
          onChange={(item) => {
            setDropdowns((prev) => ({
              ...prev,
              propertyType: item.value,
              // ✅ အကယ်၍ Condo သို့မဟုတ် Apartment မဟုတ်တာကို ပြောင်းရွေးလိုက်ရင် Floor တန်ဖိုးကို auto reset လုပ်ပေးပါတယ်
              floor:
                item.value === "condo" || item.value === "apartment"
                  ? prev.floor
                  : "",
            }));
          }}
        />
      </View>

      {/* ✅ 6.B CONDITIONAL FLOOR DROPDOWN (Condo သို့မဟုတ် Apartment ရွေးမှသာ ပေါ်လာမည်) */}
      {(dropdowns.propertyType === "condo" ||
        dropdowns.propertyType === "apartment") && (
        <View>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.containerDropdownStyle}
            itemTextStyle={styles.itemTextStyle}
            activeColor="#fef3c7"
            data={[
              { label: t("choose floor") || "All Floors", value: "" },
              { label: t("ground floor") || "Ground Floor", value: "ground" },
              {
                label: t("ground + attic") || "Ground + Attic",
                value: "ground_attic",
              },
              {
                label: `${t("floor.st") || "Low Floor (1-4)"}`,
                value: "low",
              },
              {
                label: ` ${t("floor.nd") || "Middle Floor (5-8)"}`,
                value: "mid",
              },
              {
                label: ` ${t("floor.rd") || "High Floor (9+)"}`,
                value: "high",
              },
              {
                label: ` ${t("floor.th") || "High Floor (9+)"}`,
                value: "high",
              },
            ]}
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={t("filter.floor") || "Select Floor"}
            value={dropdowns.floor}
            renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
            onChange={(item) => handleSelectDropdown("floor", item.value)}
          />
        </View>
      )}

      {/* 7. SPLIT PRICING CONTROLS */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Dropdown
            style={styles.miniDropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.containerDropdownStyle}
            itemTextStyle={styles.itemTextStyle}
            activeColor="#fef3c7"
            data={[
              { label: "100 Lakhs", value: "100" },
              { label: "500 Lakhs", value: "500" },
              { label: "1000 Lakhs", value: "1000" },
            ]}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={t("filter.minPrice") || "Min Price"}
            value={dropdowns.minPrice}
            renderRightIcon={() => <ChevronDown size={18} color="#94a3b8" />}
            onChange={(item) => handleSelectDropdown("minPrice", item.value)}
          />
        </View>

        <View className="flex-1">
          <Dropdown
            style={styles.miniDropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.containerDropdownStyle}
            itemTextStyle={styles.itemTextStyle}
            activeColor="#fef3c7"
            data={[
              { label: "2000 Lakhs", value: "2000" },
              { label: "5000 Lakhs", value: "5000" },
              { label: "10000 Lakhs", value: "10000" },
            ]}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={t("filter.maxPrice") || "Max Price"}
            value={dropdowns.maxPrice}
            renderRightIcon={() => <ChevronDown size={18} color="#94a3b8" />}
            onChange={(item) => handleSelectDropdown("maxPrice", item.value)}
          />
        </View>
      </View>

      {/* 8. ROOM COUNT SELECTOR */}
      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#fef3c7"
          data={[
            { label: `1 ${t("filter.room") || "Room"}`, value: "1" },
            { label: `2 ${t("filter.rooms") || "Rooms"}`, value: "2" },
            { label: `3 ${t("filter.rooms") || "Rooms"}`, value: "3" },
            { label: `4+ ${t("filter.rooms") || "Rooms"}`, value: "4" },
          ]}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder={t("filter.rooms") || "Rooms"}
          value={dropdowns.rooms}
          renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
          onChange={(item) => handleSelectDropdown("rooms", item.value)}
        />
      </View>

      {/* 9. DIMENSIONAL SURFACE SPECIFICATION */}
      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#fef3c7"
          data={[
            { label: "400 Sqft", value: "400" },
            { label: "800 Sqft", value: "800" },
            { label: "1200 Sqft", value: "1200" },
            { label: "2000+ Sqft", value: "2000" },
          ]}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder={t("filter.sqft") || "Square Feet"}
          value={dropdowns.sqft}
          renderRightIcon={() => <ChevronDown size={20} color="#94a3b8" />}
          onChange={(item) => handleSelectDropdown("sqft", item.value)}
        />
      </View>

      {/* DISPATCH ACTION */}
      <TouchableOpacity
        onPress={handleSearchSubmit}
        className="bg-amber-500 w-full py-4 rounded-xl items-center justify-center shadow-md active:opacity-90 mt-2"
      >
        <Text className="text-slate-800 font-bold text-lg">
          {t("filter.searchButton") || "Search"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── CUSTOM DESIGN MIXTURES ─────────────────────────────────────────
const styles = StyleSheet.create({
  dropdown: {
    height: 54,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  miniDropdown: {
    height: 54,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
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
});
