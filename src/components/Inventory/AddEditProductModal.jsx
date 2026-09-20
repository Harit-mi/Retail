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
          {/* Vertical Domain Selector */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
              Vertical Domain Category:
            </label>
            <select
              value={formData.vertical}
              onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-zinc-950 cursor-pointer"
            >
              <option value="kirana">🛒 Kirana / Grocery (FMCG / Weight)</option>
              <option value="clothing">👔 Clothing & Apparel (Size × Color Matrix)</option>
              <option value="pharmacy">💊 Pharmacy (FEFO Batch & Rx Flags)</option>
              <option value="electronics">📱 Electronics & Mobile (Serial / IMEI)</option>
              <option value="salon">💇 Salon & Spa Services (Appointment Slot)</option>
              <option value="restaurant">🍽️ Restaurant & QSR (KOT Kitchen Slot)</option>
              <option value="jewelry">💎 Jewelry & Bullion (Weight & Purity Math)</option>
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
                placeholder="e.g. Fortune Sunflower Oil 1L"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                Barcode / EAN (Optional)
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
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Grains, Dairy..."
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none transition"
              />
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
                <option value="Pcs">Pcs (Items)</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="gm">gm (Grams)</option>
                <option value="ltr">ltr (Liters)</option>
                <option value="Pack">Pack</option>
                <option value="Box">Box</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-800 block mb-1">
                HSN Code
              </label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                placeholder="e.g. 1006"
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 outline-none transition"
              />
            </div>
          </div>

          {/* Pricing: Retail, Cost, GST */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
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
                GST Slab (%)
              </label>
              <select
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
                className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-zinc-900 outline-none cursor-pointer"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% (Essential)</option>
                <option value={12}>12% (Standard)</option>
                <option value={18}>18% (General)</option>
                <option value={28}>28% (Luxury)</option>
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

          {/* Domain Specific Attributes */}
          {formData.vertical === "clothing" && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="text-[10px] font-mono uppercase font-semibold text-zinc-400 tracking-wider block">
                Apparel Matrix Attributes
              </span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Size (e.g. M, 32, XL)"
                  value={formData.attributes.size}
                  onChange={(e) => handleAttrChange("size", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="Color (e.g. Navy, Olive)"
                  value={formData.attributes.color}
                  onChange={(e) => handleAttrChange("color", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="Brand (e.g. Zara, Ray)"
                  value={formData.attributes.brand}
                  onChange={(e) => handleAttrChange("brand", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none"
                />
              </div>
            </div>
          )}

          {formData.vertical === "pharmacy" && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="text-[10px] font-mono uppercase font-semibold text-zinc-400 tracking-wider block">
                Pharmacy Batch & Schedule
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Batch No (e.g. B-902)"
                  value={formData.attributes.batch_no}
                  onChange={(e) => handleAttrChange("batch_no", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-900 outline-none"
                />
                <input
                  type="date"
                  value={formData.attributes.expiry_date}
                  onChange={(e) => handleAttrChange("expiry_date", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-900 outline-none"
                />
              </div>
            </div>
          )}
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
