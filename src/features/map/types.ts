export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
