import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";
import { Dropdown } from "react-native-element-dropdown";
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
interface Property {
  id: string;
  title_en: string;
  title_mm: string;
  price: number;
  currency_unit: string;
  deal_type: string;
  property_type: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area_value: number;
  area_unit: string;
  created_at: string;
}

export default function PropertySearchForm() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  const [dealType, setDealType] = useState("sale");
  const [agentType, setAgentType] = useState("all");
  const [textSearch, setTextSearch] = useState("");

  const [rawRegions, setRawRegions] = useState<SupabaseRegionRow[]>([]);
  const [rawTownships, setRawTownships] = useState<SupabaseTownshipRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const [isRegionFocused, setIsRegionFocused] = useState(false);
  const [isTownshipFocused, setIsTownshipFocused] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    stateRegion: "",
    township: "",
    propertyType: "",
    floor: "",
    minPrice: "",
    maxPrice: "",
    rooms: "",
    sqft: "",
  });

  const [results, setResults] = useState<Property[] | null>(null);
  const [searching, setSearching] = useState(false);

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
          floor: "",
          minPrice: "",
          maxPrice: "",
          rooms: "",
          sqft: "",
        });
        setResults(null);
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
          supabase.from("states_regions").select("id, name_en, name_mm").order("name_en", { ascending: true }),
          supabase.from("townships").select("id, region_id, name_en, name_mm").order("name_en", { ascending: true }),
        ]);
        if (regionsRes.error) throw regionsRes.error;
        if (townshipsRes.error) throw townshipsRes.error;
        setRawRegions(regionsRes.data || []);
        setRawTownships(townshipsRes.data || []);
      } catch (error: any) {
        setAlertDialog({
          title: t("error.databaseErrorTitle") || "Database Error",
          message: t("error.databaseErrorMessage") || "Could not synchronize geolocation assets.",
        });
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
    return [{ label: t("filter.allRegions") || "All Regions", value: "" }, ...formatted];
  }, [rawRegions, isBurmese, t]);

  const filteredTownships = useMemo<ApiDropdownItem[]>(() => {
    const subset = dropdowns.stateRegion
      ? rawTownships.filter((twn) => twn.region_id === dropdowns.stateRegion)
      : rawTownships;
    const formatted = subset.map((item) => ({
      label: isBurmese && item.name_mm ? item.name_mm : item.name_en,
      value: item.id,
    }));
    return [{ label: t("filter.allTownships") || "All Townships", value: "" }, ...formatted];
  }, [rawTownships, dropdowns.stateRegion, isBurmese, t]);

  const handleSelectDropdown = (key: keyof typeof dropdowns, value: string) => {
    setDropdowns((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchSubmit = async () => {
    setSearching(true);
    setResults(null);
    try {
      let query = supabase.from("properties").select("*").order("created_at", { ascending: false });

      if (dealType) query = query.eq("deal_type", dealType);
      if (dropdowns.propertyType) query = query.eq("property_type", dropdowns.propertyType);
      if (dropdowns.stateRegion) query = query.eq("state_region_id", dropdowns.stateRegion);
      if (dropdowns.township) query = query.eq("township_id", dropdowns.township);
      if (dropdowns.floor) query = query.eq("floor", dropdowns.floor);
      if (dropdowns.minPrice) query = query.gte("price", parseInt(dropdowns.minPrice));
      if (dropdowns.maxPrice) query = query.lte("price", parseInt(dropdowns.maxPrice));
      if (dropdowns.rooms) {
        if (dropdowns.rooms === "4") query = query.gte("bedrooms", 4);
        else query = query.eq("bedrooms", parseInt(dropdowns.rooms));
      }
      if (dropdowns.sqft) query = query.gte("sqft", parseInt(dropdowns.sqft));

      const { data, error } = await query;
      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      console.error("Search error:", err);
      setAlertDialog({ title: "Error", message: "Search failed. Please try again." });
    } finally {
      setSearching(false);
    }
  };

  const handleBackToForm = () => setResults(null);

  if (isLoading) {
    return (
      <View className="py-12 items-center justify-center">
        <ActivityIndicator size="small" className="text-primary-300" />
      </View>
    );
  }

  if (results !== null) {
    return (
      <View className="flex-1">
        <TouchableOpacity onPress={handleBackToForm} className="mb-4">
          <Text className="text-primary-300 font-rubik-bold">{t("filter.backToSearch") || "Back to Search"}</Text>
        </TouchableOpacity>
        <Text className="text-black-300 font-rubik-bold text-lg mb-3">
          {results.length} {results.length === 1 ? "result" : "results"} found
        </Text>
        {results.length === 0 ? (
          <View className="py-12 items-center">
            <Text className="text-black-100 font-rubik">{t("filter.noResults") || "No properties found"}</Text>
          </View>
        ) : (
          <View style={{ gap: 12, paddingBottom: 24 }}>
            {results.map((item) => {
              const title = isBurmese && item.title_mm ? item.title_mm : item.title_en;
              const price = item.currency_unit === "lakhs" ? `${item.price} Lakhs` : `$${item.price}`;
              const image = item.images?.[0];
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/detail?id=${item.id}` as any)}
                  className="bg-white rounded-2xl overflow-hidden border border-primary-200"
                >
                  {image && (
                    <Image source={{ uri: image }} className="w-full h-40" resizeMode="cover" />
                  )}
                  <View className="p-4">
                    <Text className="text-black-300 font-rubik-bold text-base" numberOfLines={1}>{title}</Text>
                    <Text className="text-primary-300 font-rubik-bold text-lg mt-1">{price}</Text>
                    <View className="flex-row items-center gap-3 mt-2">
                      <Text className="text-black-100 font-rubik text-xs">{item.bedrooms || 0} beds</Text>
                      <Text className="text-primary-200 font-rubik">|</Text>
                      <Text className="text-black-100 font-rubik text-xs">{item.bathrooms || 0} baths</Text>
                      {item.area_value && (
                        <>
                          <Text className="text-primary-200 font-rubik">|</Text>
                          <Text className="text-black-100 font-rubik text-xs">{item.area_value} {item.area_unit === "sqft" ? "sqft" : "acre"}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="gap-5">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
        <View className="flex-row gap-5 items-center pr-6">
          {(["sale", "rent", "launch", "building"] as const).map((type) => (
              <TouchableOpacity key={type} onPress={() => setDealType(type)} className="flex-row items-center gap-2">
              <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${dealType === type ? "border-primary-300" : "border-primary-200"}`}>
                {dealType === type && <View className="w-2.5 h-2.5 bg-primary-300 rounded-full" />}
              </View>
              <Text className="text-black-300 font-rubik-bold text-sm">
                {type === "sale" && (t("filter.forSale") || "For Sale")}
                {type === "rent" && (t("filter.forRent") || "For Rent")}
                {type === "launch" && (t("filter.newLaunch") || "New Launch")}
                {type === "building" && (t("filter.building") || "Building")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View>
        <Dropdown
          style={[styles.dropdown, isRegionFocused && styles.focusedBorder]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#dcfce7"
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
            setDropdowns((prev) => ({ ...prev, stateRegion: item.value, township: "" }));
            setIsRegionFocused(false);
          }}
        />
      </View>

      <View>
        <Dropdown
          style={[styles.dropdown, isTownshipFocused && styles.focusedBorder]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#dcfce7"
          data={filteredTownships}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={t("filter.township") || "Select Township"}
          value={dropdowns.township}
          onFocus={() => setIsTownshipFocused(true)}
          onBlur={() => setIsTownshipFocused(false)}
          renderRightIcon={() => <ChevronDown size={20} color="#64748b" />}
          onChange={(item) => { handleSelectDropdown("township", item.value); setIsTownshipFocused(false); }}
        />
      </View>

      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#dcfce7"
          data={[
            { label: t("filter.allProperties") || "All Property Types", value: "" },
            { label: t("property.condo") || "Condominium", value: "condo" },
            { label: t("property.apartment") || "Apartment", value: "apartment" },
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
              floor: item.value === "condo" || item.value === "apartment" ? prev.floor : "",
            }));
          }}
        />
      </View>

      {(dropdowns.propertyType === "condo" || dropdowns.propertyType === "apartment") && (
        <View>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.containerDropdownStyle}
            itemTextStyle={styles.itemTextStyle}
            activeColor="#dcfce7"
            data={[
              { label: t("choose floor") || "All Floors", value: "" },
              { label: t("ground floor") || "Ground Floor", value: "ground" },
              { label: t("ground + attic") || "Ground + Attic", value: "ground_attic" },
              { label: t("floor.st") || "Low Floor (1-4)", value: "low" },
              { label: t("floor.nd") || "Middle Floor (5-8)", value: "mid" },
              { label: t("floor.rd") || "High Floor (9+)", value: "high" },
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

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Dropdown
            style={styles.miniDropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.containerDropdownStyle}
            itemTextStyle={styles.itemTextStyle}
            activeColor="#dcfce7"
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
            activeColor="#dcfce7"
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

      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#dcfce7"
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
          renderRightIcon={() => <ChevronDown size={20} color="#94a3b8" />}
          onChange={(item) => handleSelectDropdown("rooms", item.value)}
        />
      </View>

      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.containerDropdownStyle}
          itemTextStyle={styles.itemTextStyle}
          activeColor="#dcfce7"
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

      <TouchableOpacity
        onPress={handleSearchSubmit}
        disabled={searching}
        className="bg-primary-300 w-full py-4 rounded-xl items-center justify-center mt-2"
      >
        {searching ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-rubik-bold text-lg">
            {t("filter.searchButton") || "Search"}
          </Text>
        )}
      </TouchableOpacity>

      <AlertDialog
        isOpen={!!alertDialog}
        onClose={() => setAlertDialog(null)}
        useRNModal={true}
      >
        <AlertDialog.Backdrop />
        <AlertDialog.Content className="p-6 rounded-3xl bg-white w-5/6 items-center shadow-xl">
          <AlertDialog.Header>
            <Heading>{alertDialog?.title || ""}</Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <Text className="text-center text-slate-500">{alertDialog?.message || ""}</Text>
          </AlertDialog.Body>
          <AlertDialog.Footer className="w-full flex-row justify-center">
            <Button onPress={() => setAlertDialog(null)} className="flex-1">
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: { height: 54, borderColor: "#bbf7d0", borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, backgroundColor: "#ffffff" },
  miniDropdown: { height: 54, borderColor: "#bbf7d0", borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, backgroundColor: "#ffffff" },
  focusedBorder: { borderColor: "#22c55e" },
  placeholderStyle: { fontSize: 16, color: "#8C8E98" },
  selectedTextStyle: { fontSize: 16, color: "#191D31" },
  containerDropdownStyle: { borderRadius: 12, marginTop: 4, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  itemTextStyle: { fontSize: 15, color: "#666876", textAlign: "left" },
});
