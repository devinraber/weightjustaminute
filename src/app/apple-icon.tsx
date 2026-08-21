import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS-specific home-screen icon (read directly by Safari, separate from the web manifest). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16a34a",
          color: "white",
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 76,
        }}
      >
        WJ
      </div>
    ),
    { ...size },
  );
}
