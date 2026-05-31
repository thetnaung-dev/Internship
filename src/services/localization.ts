// ── services/locationService.ts ──────────────────────────────────

export interface DropdownItem {
  label: string; // The text displayed to the user (e.g., "Yangon Region")
  value: string; // The ID value stored in state (e.g., "MMR013")
}

export interface TownshipItem extends DropdownItem {
  regionId: string; // Used to link/filter the cascading township lists
}

const BASE_URL =
  "https://raw.githubusercontent.com/colbyfayock/myanmar-datasets/main/data";

export const LocationService = {
  /**
   * Fetches States/Regions and maps them into Dropdown Items
   */
  async getRegions(): Promise<DropdownItem[]> {
    const response = await fetch(`${BASE_URL}/states-regions.json`);
    if (!response.ok) throw new Error("Failed to fetch regions");
    const data = await response.json();

    // Fallback labels provided if English fields are missing
    return data
      .map((item: any) => ({
        label: item.nameEnglish || item.name,
        value: item.stateRegionCode || item.id,
      }))
      .sort((a: DropdownItem, b: DropdownItem) =>
        a.label.localeCompare(b.label),
      );
  },

  /**
   * Fetches Townships and maps them into Dropdown Items
   */
  async getTownships(): Promise<TownshipItem[]> {
    const response = await fetch(`${BASE_URL}/townships.json`);
    if (!response.ok) throw new Error("Failed to fetch townships");
    const data = await response.json();

    return data
      .map((item: any) => ({
        label: item.nameEnglish || item.name,
        value: item.townshipCode || item.id,
        regionId: item.stateRegionCode || item.stateRegionId,
      }))
      .sort(
        (a: TownshipItem, b: TownshipItem) => a.label.localeCompare(b.label), // Fixed the .label.label typo here!
      );
  },
};
