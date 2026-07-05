/** Demo coordinates for branch cities */
export const BRANCH_COORDS: Record<string, { lat: number; lng: number }> = {
  Київ: { lat: 50.4501, lng: 30.5234 },
  Львів: { lat: 49.8397, lng: 24.0297 },
  Варшава: { lat: 52.2297, lng: 21.0122 },
  "Тель-Авів": { lat: 32.0853, lng: 34.7818 },
  Алмати: { lat: 43.222, lng: 76.8512 },
  Торонто: { lat: 43.6532, lng: -79.3832 },
};

export function getBranchCoords(
  city: string,
  branch?: { latitude?: number | null; longitude?: number | null }
) {
  if (branch?.latitude != null && branch?.longitude != null) {
    return { lat: branch.latitude, lng: branch.longitude };
  }
  return BRANCH_COORDS[city] || { lat: 50.45, lng: 30.52 };
}
