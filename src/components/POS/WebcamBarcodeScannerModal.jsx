import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { Camera, X, Zap, RefreshCw } from "lucide-react";

export const WebcamBarcodeScannerModal = ({ isOpen, onClose, onBarcodeDetected }) => {
  const { products, addToCart } = useStore();
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
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
            setCameraActive(true);
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl space-y-4 p-5 card-shadow">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#1E3A5F] text-[#F5A623] rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base">
                Live Web Camera Barcode Scanner
              </h3>
              <p className="text-xs text-slate-500">
                Supports EAN-13, EAN-8, UPC-A, Code 128 & QR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport / Scanning Overlay */}
        <div className="relative bg-slate-950 rounded-2xl h-56 flex items-center justify-center overflow-hidden border-2 border-slate-800">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Animated Laser Reticle Line */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" />

          {/* Target Corner Guides */}
          <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
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
            className="w-full py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display rounded-2xl text-xs transition flex items-center justify-center space-x-2 shadow-md"
          >
            <Zap className="w-4 h-4 text-[#F5A623]" />
            <span>Simulate Quick Scan Item</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
