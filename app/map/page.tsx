"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MapIframe() {
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat") || "";
  const lng = searchParams.get("lng") || "";
  
  return (
    <iframe
      src={`/map-view.html?lat=${lat}&lng=${lng}`}
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
        margin: 0,
        padding: 0,
        overflow: "hidden"
      }}
      title="Alerto Live Tracking Map"
    />
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b0f19",
        color: "#fff",
        fontFamily: "system-ui, sans-serif"
      }}>
        Loading Map...
      </div>
    }>
      <MapIframe />
    </Suspense>
  );
}
