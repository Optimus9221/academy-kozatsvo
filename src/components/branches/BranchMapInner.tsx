"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapBranch } from "./BranchMap";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function BranchMapInner({ branches }: { branches: MapBranch[] }) {
  const center = branches[0] || { lat: 50.45, lng: 30.52 };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={5}
      scrollWheelZoom={false}
      className="h-80 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {branches.map((b) => (
        <Marker key={b.id} position={[b.lat, b.lng]} icon={icon}>
          <Popup>
            <strong>{b.name}</strong>
            <br />
            {b.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
