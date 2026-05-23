import { supabase } from "../../../lib/supabase";
import type { EnglishMedicine, TraditionalMedicine } from "../types/medicine";

export type UnifiedMedicine = (EnglishMedicine | TraditionalMedicine) & {
  keywords?: string;
};

export async function fetchAllCuratedMedicines(): Promise<UnifiedMedicine[]> {
  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .order("name_en", { ascending: true });

  if (error) {
    console.error("Error fetching curated medicines from Supabase:", error);
    throw error;
  }

  if (!data) return [];

  // Safely translate database schemas directly to what your React components need
  return data.map((item) => {
    if (item.type === "english") {
      return {
        id: item.id,
        type: "english",
        name: item.name_en || "Unknown Medicine",
        generic_name: item.generic_name || "N/A",
        category: item.category_en || "General",
        benefits: item.benefits_en || "",
        dosage: item.usage_en || "", // Maps Supabase 'usage_en' to UI 'dosage'
        warnings: item.warnings_en || "",
        image_url: item.image_url || undefined,
        keywords: item.keywords || "",
      } as EnglishMedicine & { keywords?: string };
    } else {
      return {
        id: item.id,
        type: "traditional",
        name_en: item.name_en || "",
        name_my: item.name_my || "",
        category_en: item.category_en || "",
        category_my: item.category_my || "",
        benefits_en: item.benefits_en || "",
        benefits_my: item.benefits_my || "",
        usage_en: item.usage_en || "",
        usage_my: item.usage_my || "",
        ingredients_en: item.ingredients_en || "",
        ingredients_my: item.ingredients_my || "",
        warnings_en: item.warnings_en || "",
        warnings_my: item.warnings_my || "",
        image_url: item.image_url || undefined,
        keywords: item.keywords || "",
      } as TraditionalMedicine & { keywords?: string };
    }
  });
}
