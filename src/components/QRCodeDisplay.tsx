"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeDisplay({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 180,
      margin: 2,
      color: { dark: "#1C2018", light: "#F5F0E8" },
    }).then(setDataUrl).catch(console.error);
  }, [url]);

  if (!dataUrl) return <div className="w-[180px] h-[180px] rounded-lg bg-ivory animate-pulse" />;

  return <img src={dataUrl} alt="QR Code do site" className="w-[180px] h-[180px] rounded-lg" />;
}
