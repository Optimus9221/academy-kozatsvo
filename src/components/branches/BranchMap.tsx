"use client";

import dynamic from "next/dynamic";

export interface MapBranch {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

const MapInner = dynamic(() => import("./BranchMapInner"), { ssr: false });

export function BranchMap({ branches }: { branches: MapBranch[] }) {
  if (branches.length === 0) return null;
  return (
    <div className="mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-md">
      <MapInner branches={branches} />
    </div>
  );
}
