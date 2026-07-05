import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffd700",
          borderRadius: "50%",
          fontSize: 11,
          fontWeight: 700,
          color: "#0a1f44",
        }}
      >
        МАК
      </div>
    ),
    { ...size }
  );
}
