import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../context/useStore";
import { X, Package } from "lucide-react";

export const AddEditProductModal = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, activeVertical } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "General",
    hsn: "",
    gst: 5,
    retailPrice: "",
    wholesalePrice: "",
    costPrice: "",
    stock: 10,
    unit: "Pcs",
    vertical: activeVertical === "all" ? "kirana" : activeVertical,
    minStockWarning: 5,
    attributes: {
      size: "",
      color: "",
      brand: "",
      batch_no: "",
      expiry_date: "",
      requires_prescription: false,
      drug_schedule: "Schedule H",
      imei: "",
      serial_no: "",
      warranty_months: 12,
      duration_mins: 30,
      purity: "22K (916)",
      gross_weight: "",
      net_weight: "",
      making_charge_type: "flat",
      making_charge_value: "",
    },
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        barcode: productToEdit.barcode || "",
        category: productToEdit.category || "General",
        hsn: productToEdit.hsn || "",
        gst: productToEdit.gst || 5,
        retailPrice: productToEdit.retailPrice || "",
        wholesalePrice: productToEdit.wholesalePrice || "",
        costPrice: productToEdit.costPrice || "",
        stock: productToEdit.stock || 0,
        unit: productToEdit.unit || "Pcs",
        vertical: productToEdit.vertical || (activeVertical === "all" ? "kirana" : activeVertical),
        minStockWarning: productToEdit.minStockWarning || 5,
        attributes: {
          size: "",
          color: "",
          brand: "",
          batch_no: "",
          expiry_date: "",
          requires_prescription: false,
          drug_schedule: "Schedule H",
          imei: "",
          serial_no: "",
          warranty_months: 12,
          duration_mins: 30,
          purity: "22K (916)",
          gross_weight: "",
          net_weight: "",
          making_charge_type: "flat",
          making_charge_value: "",
          ...(productToEdit.attributes || {}),
        },
      });
    } else {
      setFormData({
        name: "",
        barcode: "",
        category: "General",
        hsn: "",
        gst: 5,
        retailPrice: "",
        wholesalePrice: "",
        costPrice: "",
        stock: 10,
        unit: "Pcs",
        vertical: activeVertical === "all" ? "kirana" : activeVertical,
        minStockWarning: 5,
        attributes: {
          size: "",
          color: "",
          brand: "",
          batch_no: "",
          expiry_date: "",
          requires_prescription: false,
          drug_schedule: "Schedule H",
          imei: "",
          serial_no: "",
          warranty_months: 12,
          duration_mins: 30,
          purity: "22K (916)",
          gross_weight: "",
          net_weight: "",
          making_charge_type: "flat",
          making_charge_value: "",
        },
      });
    }
  }, [productToEdit, activeVertical, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.retailPrice) return;

    if (productToEdit) {
      updateProduct(productToEdit.id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  const handleAttrChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  };

  const modalJSX = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs overflow-y-auto overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto shrink-0"
        style={{
          maxHeight: "min(92vh, 680px)",
          height: "fit-content",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="px-5 py-3.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 id="product-modal-title" className="font-bold text-sm text-zinc-950 leading-tight">
                {productToEdit ? "Edit Inventory Item" : "Add Inventory Item"}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Catalog & stock configuration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-edit-product-form"
          onSubmit={handleSubmit}
          className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto text-xs overscroll-contain"
        >
          {/* Retail Category & Type Selector */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
              Retail Department / Category Type:
            </label>
            <select
              value={formData.vertical || "retail"}
              onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-950 cursor-pointer"
            >
              <option value="retail">🛍️ General Retail Goods & FMCG (Standard SKU)</option>
              <option value="clothing">👔 Apparel, Garments & Footwear (Size, Color, Brand)</option>
              <option value="pharmacy">💊 Pharmacy, Chemist & Wellness (Batch No, Expiry)</option>
              <option value="electronics">📱 Electronics & Mobile (Serial / IMEI, Warranty)</option>
              <option value="hardware">🔧 Hardware, Electrical & Tools (Model, Gauge, Unit)</option>
              <option value="stationery">📚 Stationery, Books & Toys (Pack, Brand)</option>
              <option value="cosmetics">💄 Cosmetics & Beauty Products (Batch, Brand)</option>
            </select>
          </div>

          {/* Product Name & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fortune Sunflower Oil 1L / Men Cotton Shirt"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Barcode / EAN / SKU (Optional)
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Scan or enter barcode"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 outline-none transition"
              />
            </div>
          </div>

          {/* Category, Unit, HSN */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Category
              </label>
              <input
                type="text"
                list="retail-category-suggestions"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Apparel, Grains..."
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none transition"
              />
              <datalist id="retail-category-suggestions">
                <option value="General Retail" />
                <option value="Groceries & FMCG" />
                <option value="Atta & Flours" />
                <option value="Edible Oils" />
                <option value="Dairy & Bakery" />
                <option value="Snacks & Beverages" />
                <option value="Men Wear" />
                <option value="Women & Ethnic Wear" />
                <option value="Footwear" />
                <option value="Smartphones & Mobiles" />
                <option value="Mobile Accessories" />
                <option value="Electricals & Hardware" />
                <option value="Analgesics & Fever" />
                <option value="Antibiotics" />
                <option value="Cosmetics & Skincare" />
                <option value="Stationery & Books" />
                <option value="Home & Kitchen" />
              </datalist>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none cursor-pointer"
              >
                <option value="Pcs">Pcs (Pieces / नग)</option>
                <option value="Pack">Pack (Packet / पैकेट)</option>
                <option value="Box">Box (Carton / डिब्बा)</option>
                <option value="Pair">Pair (जोड़ी - Shoes/Gloves)</option>
                <option value="Set">Set (सेट)</option>
                <option value="Roll">Roll (रोल - Wires/Fabrics)</option>
                <option value="Strip">Strip (स्ट्रिप - Medicine)</option>
                <option value="Bottle">Bottle (बोतल)</option>
                <option value="Can">Can (कैन)</option>
                <option value="Dozen">Dozen (दर्जन)</option>
                <option value="Bundle">Bundle (बंडल)</option>
                <option value="kg">kg (Kilogram / किलो)</option>
                <option value="gm">gm (Gram / ग्राम)</option>
                <option value="ltr">ltr (Liter / लीटर)</option>
                <option value="ml">ml (Milliliter / मिलीलीटर)</option>
                <option value="Mtr">Mtr (Meter / मीटर)</option>
                <option value="SqFt">SqFt (Square Feet)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                HSN / SAC Code
              </label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                placeholder="e.g. 6205 or 1006"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 outline-none transition"
              />
            </div>
          </div>

          {/* Pricing: Retail, Cost, Wholesale, GST */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Retail Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono font-bold text-zinc-950 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Cost Price (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Wholesale (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.wholesalePrice || ""}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                placeholder="Optional"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                GST Slab (%)
              </label>
              <select
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-zinc-900 outline-none cursor-pointer"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={3}>3% (Gold/Precious)</option>
                <option value={5}>5% (Essential/Apparel)</option>
                <option value={12}>12% (Standard/Stationery)</option>
                <option value={18}>18% (General/Electronics)</option>
                <option value={28}>28% (Luxury/Hardware)</option>
              </select>
            </div>
          </div>

          {/* Stock Quantities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Current Stock Qty
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                placeholder="10"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-zinc-900 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Low Stock Threshold Warning
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockWarning}
                onChange={(e) => setFormData({ ...formData, minStockWarning: Number(e.target.value) })}
                placeholder="5"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 outline-none transition"
              />
            </div>
          </div>

          {/* Universal Retail Specifications & Tracking */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
            <span className="text-[10px] font-mono uppercase font-semibold text-zinc-500 tracking-wider block">
              Retail Specifications & Tracking (Optional):
            </span>

            {/* Brand & Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Brand / Manufacturer (e.g. Nike, Samsung)"
                value={formData.attributes.brand || ""}
                onChange={(e) => handleAttrChange("brand", e.target.value)}
                className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none"
              />
              <input
                type="text"
                placeholder="Size / Dimension (e.g. L, 32, 100ml, A4)"
                value={formData.attributes.size || ""}
                onChange={(e) => handleAttrChange("size", e.target.value)}
                className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none"
              />
              <input
                type="text"
                placeholder="Color / Finish (e.g. Navy, Matte Black)"
                value={formData.attributes.color || ""}
                onChange={(e) => handleAttrChange("color", e.target.value)}
                className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none"
              />
            </div>

            {/* Batch & Expiry (Food, FMCG, Pharma, Cosmetics) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-zinc-200/60">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 w-16 shrink-0">Batch No:</span>
                <input
                  type="text"
                  placeholder="e.g. BATCH-2026A"
                  value={formData.attributes.batch_no || ""}
                  onChange={(e) => handleAttrChange("batch_no", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-900 outline-none flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 w-16 shrink-0">Expiry Date:</span>
                <input
                  type="date"
                  value={formData.attributes.expiry_date || ""}
                  onChange={(e) => handleAttrChange("expiry_date", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-900 outline-none flex-1"
                />
              </div>
            </div>

            {/* Serial / IMEI & Warranty (Electronics, Mobile, Appliances, Hardware) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-zinc-200/60">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 w-16 shrink-0">Serial/IMEI:</span>
                <input
                  type="text"
                  placeholder="e.g. 864201048291048"
                  value={formData.attributes.imei || formData.attributes.serial_no || ""}
                  onChange={(e) => handleAttrChange("imei", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-900 outline-none flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 w-16 shrink-0">Warranty:</span>
                <input
                  type="number"
                  placeholder="Warranty in months (e.g. 12)"
                  value={formData.attributes.warranty_months || ""}
                  onChange={(e) => handleAttrChange("warranty_months", Number(e.target.value))}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-900 outline-none flex-1"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Pinned Action Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-edit-product-form"
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            {productToEdit ? "Save Changes" : "Add to Inventory"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalJSX, document.body) : null;
};
