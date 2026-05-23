import { useEffect, useMemo, useState } from "react";
import {
    fetchAllCuratedMedicines,
    type UnifiedMedicine,
} from "../services/medicineService";
import type { MedicineFilter } from "../types/medicine";

export function useMedicine() {
  const [allMedicines, setAllMedicines] = useState<UnifiedMedicine[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [filter, setFilter] = useState<MedicineFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMedicines() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllCuratedMedicines();
        setAllMedicines(data);
      } catch (err) {
        console.error("Hook catch block caught:", err);
        setError("Failed to load medicine list from cloud database");
      } finally {
        setLoading(false);
      }
    }
    loadMedicines();
  }, []);

  const displayed = useMemo(() => {
    return allMedicines.filter((med) => {
      // 1. Tab segment filtering logic
      if (filter === "traditional" && med.type !== "traditional") return false;
      if (filter === "english" && med.type !== "english") return false;

      // 2. Default: If no interactive symptom tag is active, return all items
      if (selectedSymptoms.length === 0) return true;

      // 3. Match item keywords column safely against selected filters
      const medKeywords = (med.keywords || "").toLowerCase();

      return selectedSymptoms.some((symptom) =>
        medKeywords.includes(symptom.toLowerCase()),
      );
    });
  }, [selectedSymptoms, filter, allMedicines]);

  return {
    displayed,
    selectedSymptoms,
    setSelectedSymptoms,
    filter,
    setFilter,
    loading,
    error,
  };
}
