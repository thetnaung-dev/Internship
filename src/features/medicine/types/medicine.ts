export type MedicineFilter = "all" | "traditional" | "english";

export interface EnglishMedicine {
  id: string | number;
  type: "english";
  name: string;
  generic_name: string;
  category: string;
  benefits: string;
  dosage: string;
  warnings: string;
  image_url?: string;
}

export interface TraditionalMedicine {
  id: number;
  type: "traditional";
  name_en: string;
  name_my: string;
  category_en: string;
  category_my: string;
  benefits_en: string;
  benefits_my: string;
  usage_en: string;
  usage_my: string;
  ingredients_en: string;
  ingredients_my: string;
  warnings_en: string;
  warnings_my: string;
  image_url?: string;
}

// Added an explicit keywords check property to your core intersection union type
export type UnifiedMedicine = (EnglishMedicine | TraditionalMedicine) & {
  keywords?: string;
};
