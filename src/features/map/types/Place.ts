export type Place = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distance: string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  photos?: string[];
};
