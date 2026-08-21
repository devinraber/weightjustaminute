import { ImageResponse } from "next/og";

/**
 * Generates the PWA home-screen icon on the fly (no /public image asset needed)
 * at a requested pixel size, referenced by the web app manifest for Android/Chrome install.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dimension = Number(size.replace(/\D/g, "")) || 512;

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
        }}
      >
        <span style={{ fontSize: dimension * 0.42 }}>WJ</span>
      </div>
    ),
    { width: dimension, height: dimension },
  );
}
