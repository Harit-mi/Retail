import { useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";

/**
 * Custom Hook: Global Hardware Barcode Scanner Listener (HID USB / Bluetooth Scanners)
 * Listens for rapid keystrokes (<50ms inter-keystroke timing) ending with 'Enter'.
 * Auto-matches barcode in inventory and adds item to cart.
 */
export const useBarcodeScanner = (onScannedSuccess) => {
  const { products, addToCart } = useStore();
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Ignore input if user is actively typing inside a form text input (unless fast barcode speed)
      const targetTag = e.target.tagName.toLowerCase();
      const isInput = targetTag === "input" || targetTag === "textarea" || targetTag === "select";

      // If time between keys is short (<50ms), it's likely a hardware barcode scanner
      if (timeDiff > 100 && isInput && e.key !== "Enter") {
        bufferRef.current = "";
        return;
      }

      if (e.key === "Enter") {
        const barcodeStr = bufferRef.current.trim();
        if (barcodeStr.length >= 3) {
          e.preventDefault();
          // Find product matching barcode or HSN
          const matched = products.find(
            (p) =>
              (p.barcode && p.barcode === barcodeStr) ||
              (p.attributes?.imei && p.attributes.imei === barcodeStr) ||
              (p.hsn && p.hsn === barcodeStr)
          );

          if (matched) {
            addToCart(matched, 1);
            if (onScannedSuccess) onScannedSuccess(matched);
          }
          bufferRef.current = "";
        }
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, addToCart, onScannedSuccess]);
};
