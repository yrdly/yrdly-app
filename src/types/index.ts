export interface Business {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  description: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
}