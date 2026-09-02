import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { Camera, X, Zap } from "lucide-react";

export const WebcamBarcodeScannerModal = ({ isOpen, onClose, onBarcodeDetected }) => {
  const { products, addToCart } = useStore();
  const videoRef = useRef(null);
  const [scanMessage, setScanMessage] = useState("Point camera at product barcode (EAN-13/UPC)");

  useEffect(() => {
    let stream = null;

    if (isOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn("Camera access failed:", err);
          setScanMessage("Camera access unavailable. Use simulation or USB scanner.");
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateCameraScan = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    if (randomProduct) {
      addToCart(randomProduct, 1);
      if (onBarcodeDetected) onBarcodeDetected(randomProduct);
      setScanMessage(`✓ Scanned: ${randomProduct.name}`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Register-panel header, consistent with Payment & Customer modals */}
        <div className="bg-[#0F1F35] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#F5A623] text-slate-950 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold font-display text-white text-sm">
                Live Camera Barcode Scanner
              </h3>
              <p className="text-[11px] text-slate-400">
                EAN-13, EAN-8, UPC-A, Code 128 & QR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewport / Scanning Overlay */}
          <div className="relative bg-slate-950 rounded-lg h-56 flex items-center justify-center overflow-hidden border border-slate-800">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {/* Animated Laser Reticle Line */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" />

            {/* Target Corner Guides */}
            <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-white/70 font-mono font-bold bg-black/60 px-2 py-1 rounded">
                ALIGN BARCODE IN FRAME
              </span>
            </div>
          </div>

          <p className="text-center text-xs font-bold text-slate-700 font-mono">
            {scanMessage}
          </p>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleSimulateCameraScan}
              className="w-full py-3.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display rounded-lg text-xs transition flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Zap className="w-4 h-4 text-[#F5A623]" />
              <span>Simulate Quick Scan Item</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
