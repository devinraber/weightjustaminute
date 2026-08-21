"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X, Keyboard } from "lucide-react";

interface BarcodeScannerModalProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

/** Live camera barcode scanner (UPC/EAN) with a manual-entry fallback, using ZXing (works on iOS + Android). */
export default function BarcodeScannerModal({ onDetected, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  useEffect(() => {
    if (manualMode) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    let cancelled = false;
    let controls: { stop: () => void } | undefined;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, err, ctrls) => {
        controls = ctrls;
        if (cancelled) return;
        if (result) {
          controls?.stop();
          onDetected(result.getText());
        }
        // NotFoundException fires continuously while no barcode is in frame - not a real error.
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't access the camera. You can enter the barcode number instead.");
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualMode]);

  function handleManualSubmit() {
    const trimmed = manualBarcode.trim();
    if (trimmed.length < 6) return;
    onDetected(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scan barcode</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {manualMode ? (
          <div className="flex flex-col gap-3">
            <input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              type="text"
              inputMode="numeric"
              placeholder="Enter barcode number"
              autoFocus
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleManualSubmit}
              className="rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Look up
            </button>
            <button
              onClick={() => setManualMode(false)}
              className="text-center text-xs text-slate-500 underline"
            >
              Use camera instead
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
            </div>
            <p className="text-center text-xs text-slate-400">Point your camera at a product barcode.</p>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <button
              onClick={() => setManualMode(true)}
              className="flex items-center justify-center gap-1 text-xs text-slate-500 underline"
            >
              <Keyboard size={14} /> Enter barcode manually instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
