export type Place = {
  id: string;

  name: string;

  type: "Hospital" | "Pharmacy";

  latitude: number;

  longitude: number;

  distance: string;

  address?: string;

  phone?: string;

  website?: string;

  openingHours?: string;
};
