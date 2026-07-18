import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-static";

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
          background: "#161616",
          color: "#f2f0e8",
          border: "32px solid #2454d6",
          fontFamily: "Arial, sans-serif",
          fontSize: 176,
          fontWeight: 700,
        }}
      >
        A0
      </div>
    ),
    size,
  );
}
