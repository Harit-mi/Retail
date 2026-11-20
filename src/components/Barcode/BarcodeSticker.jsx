import React from "react";
import { BarcodeSvg } from "./BarcodeSvg";

/**
 * Standard Retail Barcode Sticker Component
 * Formatted for standard Indian commercial peel-off label sheets & thermal rolls:
 * - A4 (24-up: 66mm × 34mm)
 * - A4 (40-up: 48.5mm × 25.4mm)
 * - A4 (65-up: 38.1mm × 21.2mm)
 * - Thermal Roll (50mm × 25mm / 2" × 1")
 * - Thermal Roll (50mm × 38mm / 2" × 1.5")
 */
export const BarcodeSticker = ({
  item,
  storeConfig = {},
  format = "a4-24", // 'a4-24' | 'a4-40' | 'a4-65' | 'thermal-50x25' | 'thermal-50x38'
  options = {
    showStoreName: true,
    showPrice: true,
    showUnit: true,
    showDate: true,
    showBatch: true,
    showFssai: false,
    packedDate: "Today",
    batchNo: "B26-01",
  },
  isZoomed = false,
  className = "",
}) => {
  if (!item) return null;

  const storeName = storeConfig.name || "Gupta Multi-Vertical Retail";
  const fssai = storeConfig.fssai;
  const barcodeValue = item.barcode || "890105800124";
  const price = Number(item.retailPrice ?? item.price ?? 0);
  const mrp = Number(item.mrp ?? price);
  const unit = item.unit || "Pcs";

  // Dimension and scale mappings per label format
  const getFormatSpecs = () => {
    switch (format) {
      case "a4-65":
        return {
          barcodeScale: isZoomed ? 2.0 : 0.95,
          barcodeHeight: isZoomed ? 50 : 26,
          fontSize: isZoomed ? 12 : 7,
          nameClass: "text-[9px] font-extrabold line-clamp-1",
          storeClass: "text-[7px] font-bold text-zinc-600 truncate",
          priceClass: "text-[9px] font-black font-mono",
          containerClass: "p-1.5 h-[21.2mm] max-h-[21.2mm]",
        };
      case "a4-40":
        return {
          barcodeScale: isZoomed ? 2.2 : 1.15,
          barcodeHeight: isZoomed ? 52 : 30,
          fontSize: isZoomed ? 12 : 8,
          nameClass: "text-[10px] font-extrabold line-clamp-1",
          storeClass: "text-[8px] font-bold text-zinc-600 truncate",
          priceClass: "text-[10px] font-black font-mono",
          containerClass: "p-2 h-[25.4mm] max-h-[25.4mm]",
        };
      case "thermal-50x25":
        return {
          barcodeScale: isZoomed ? 2.2 : 1.2,
          barcodeHeight: isZoomed ? 52 : 30,
          fontSize: isZoomed ? 12 : 8,
          nameClass: "text-[10px] font-extrabold line-clamp-1",
          storeClass: "text-[8px] font-bold text-zinc-600 truncate",
          priceClass: "text-[10px] font-black font-mono",
          containerClass: "p-2 h-[25mm] max-h-[25mm]",
        };
      case "thermal-50x38":
        return {
          barcodeScale: isZoomed ? 2.4 : 1.35,
          barcodeHeight: isZoomed ? 60 : 38,
          fontSize: isZoomed ? 13 : 9,
          nameClass: "text-xs font-extrabold line-clamp-1",
          storeClass: "text-[9px] font-bold text-zinc-600 truncate",
          priceClass: "text-xs font-black font-mono",
          containerClass: "p-2.5 h-[38mm] max-h-[38mm]",
        };
      case "a4-24":
      default:
        return {
          barcodeScale: isZoomed ? 2.4 : 1.35,
          barcodeHeight: isZoomed ? 58 : 36,
          fontSize: isZoomed ? 13 : 9,
          nameClass: "text-xs font-extrabold line-clamp-1",
          storeClass: "text-[9px] font-bold text-zinc-600 truncate",
          priceClass: "text-xs font-black font-mono",
          containerClass: "p-2.5 h-[34mm] max-h-[34mm]",
        };
    }
  };

  const specs = getFormatSpecs();

  return (
    <div
      className={`bg-white text-zinc-950 flex flex-col justify-between items-center text-center overflow-hidden box-border select-none leading-none relative print:p-1.5 ${
        isZoomed
          ? "p-5 rounded-xl border-2 border-zinc-900 shadow-xl w-full max-w-sm"
          : `${specs.containerClass} rounded-xs border border-zinc-300 print:border-none shadow-2xs w-full`
      } ${className}`}
      style={{
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* 1. Header: Store Name & Optional FSSAI */}
      {options.showStoreName && (
        <div className="w-full truncate px-0.5">
          <div className={`${specs.storeClass} uppercase tracking-tight`}>
            {storeName}
          </div>
          {options.showFssai && fssai && (
            <div className="text-[7px] text-zinc-500 font-mono">
              FSSAI: {fssai}
            </div>
          )}
        </div>
      )}

      {/* 2. Product Name & Weight */}
      <div className="w-full px-0.5 my-0.5">
        <h4 className={`${specs.nameClass} text-zinc-900 leading-tight`}>
          {item.name}
          {options.showUnit && unit && (
            <span className="text-zinc-600 font-normal font-sans ml-1">
              ({unit})
            </span>
          )}
        </h4>
      </div>

      {/* 3. Mathematical Vector GS1 EAN-13 Barcode */}
      <div className="w-full flex justify-center items-center my-0.5 overflow-hidden">
        <BarcodeSvg
          barcode={barcodeValue}
          height={specs.barcodeHeight}
          scale={specs.barcodeScale}
          fontSize={specs.fontSize}
          showText={true}
        />
      </div>

      {/* 4. Footer: MRP, Batch & Packed Date */}
      <div className="w-full flex items-baseline justify-between px-1 pt-0.5 border-t border-dotted border-zinc-300 mt-auto">
        {/* Meta Info (Packed Date / Batch) */}
        <div className="text-left text-[7px] font-mono text-zinc-500 leading-tight">
          {options.showDate && (
            <div>Pkd: {options.packedDate || "Nov 2026"}</div>
          )}
          {options.showBatch && (
            <div>B.No: {options.batchNo || "B-26"}</div>
          )}
        </div>

        {/* High-Contrast Price Display */}
        {options.showPrice && (
          <div className="text-right">
            <span className={`${specs.priceClass} text-zinc-950`}>
              MRP: ₹{price}
            </span>
            {mrp > price && (
              <span className="text-[7px] font-mono line-through text-zinc-400 block">
                ₹{mrp}
              </span>
            )}
            <span className="text-[6px] text-zinc-500 block uppercase">
              (Incl. Taxes)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};