import React, { useState, useEffect } from "react";
import { useStore } from "../../context/useStore";
import { X } from "lucide-react";

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
    // Dynamic Attributes
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
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        category: "General",
        hsn: "1902",
        gst: 5,
        retailPrice: "",
        wholesalePrice: "",
        costPrice: "",
        stock: 20,
        unit: "Pcs",
        vertical: activeVertical === "all" ? "kirana" : activeVertical,
        minStockWarning: 5,
        attributes: {
          size: "",
          color: "",
          brand: "",
          batch_no: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          expiry_date: "2027-12-31",
          requires_prescription: false,
          drug_schedule: "Schedule H",
          imei: "",
          serial_no: "",
          warranty_months: 12,
          duration_mins: 30,
          purity: "22K (916)",
          gross_weight: "10.5",
          net_weight: "10.0",
          making_charge_type: "flat",
          making_charge_value: "500",
        },
      });
    }
  }, [productToEdit, isOpen, activeVertical]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col card-shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-extrabold text-slate-900 font-display text-base flex items-center space-x-2">
            <span>{productToEdit ? "Edit Product Details" : "Add Vertical Inventory Item"}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Vertical Selector Switch */}
          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Select Vertical Domain Format:
            </label>
            <select
              value={formData.vertical}
              onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#1E3A5F] outline-none cursor-pointer"
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

          {/* Product Name */}
          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paracetamol 500mg, Denim Jacket, Gold Ring 22K"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#1E3A5F] focus:bg-white"
            />
          </div>

          {/* Category & Barcode Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Category..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Barcode Number
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="8901058..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          {/* HSN Code & GST Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                HSN Code
              </label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                placeholder="e.g. 3004 / 6205"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                GST Rate (%)
              </label>
              <select
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-teal-700 font-bold outline-none cursor-pointer"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={3}>3% (Gold/Jewelry GST)</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
            </div>
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Retail Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                placeholder="145"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#1FAA59] font-black font-mono outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Stock Qty
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
              >
                <option value="Pcs">Pcs</option>
                <option value="Strip">Strip</option>
                <option value="g">g (Gram)</option>
                <option value="kg">kg</option>
                <option value="Pair">Pair</option>
                <option value="Slot">Slot</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC VERTICAL-SPECIFIC ATTRIBUTES ADAPTER */}

          {/* 👔 APPAREL SPECIFIC FIELDS */}
          {formData.vertical === "clothing" && (
            <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3">
              <h5 className="text-xs font-extrabold text-indigo-900 font-display uppercase tracking-wider">
                👔 Apparel Size × Color × Brand Grid
              </h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Size</label>
                  <input
                    type="text"
                    value={formData.attributes.size}
                    onChange={(e) => handleAttrChange("size", e.target.value)}
                    placeholder="M, L, XL, 32"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Brand</label>
                  <input
                    type="text"
                    value={formData.attributes.brand}
                    onChange={(e) => handleAttrChange("brand", e.target.value)}
                    placeholder="Levi's, Biba"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Color</label>
                  <input
                    type="text"
                    value={formData.attributes.color}
                    onChange={(e) => handleAttrChange("color", e.target.value)}
                    placeholder="Navy Blue, Red"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 💊 PHARMACY SPECIFIC FIELDS */}
          {formData.vertical === "pharmacy" && (
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-3">
              <h5 className="text-xs font-extrabold text-red-900 font-display uppercase tracking-wider">
                💊 FEFO Batch & Drug Schedule Flags
              </h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Batch No</label>
                  <input
                    type="text"
                    value={formData.attributes.batch_no}
                    onChange={(e) => handleAttrChange("batch_no", e.target.value)}
                    placeholder="BAT-9081"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.attributes.expiry_date}
                    onChange={(e) => handleAttrChange("expiry_date", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Drug Schedule</label>
                  <select
                    value={formData.attributes.drug_schedule}
                    onChange={(e) => handleAttrChange("drug_schedule", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="OTC">OTC (Over Counter)</option>
                    <option value="Schedule H">Schedule H (Rx Needed)</option>
                    <option value="Schedule H1">Schedule H1 (Narcotic)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 💎 JEWELRY SPECIFIC FIELDS */}
          {formData.vertical === "jewelry" && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <h5 className="text-xs font-extrabold text-amber-950 font-display uppercase tracking-wider">
                💎 Bullion Gold/Silver Weight & Purity Math
              </h5>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Purity</label>
                  <select
                    value={formData.attributes.purity}
                    onChange={(e) => handleAttrChange("purity", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-amber-950 outline-none"
                  >
                    <option value="24K (999)">24K (999 Pure)</option>
                    <option value="22K (916)">22K (916 BIS)</option>
                    <option value="18K (750)">18K (750 Gold)</option>
                    <option value="Silver 925">Silver 925</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Gross Wt (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.attributes.gross_weight}
                    onChange={(e) => handleAttrChange("gross_weight", e.target.value)}
                    placeholder="10.5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Net Wt (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.attributes.net_weight}
                    onChange={(e) => handleAttrChange("net_weight", e.target.value)}
                    placeholder="10.0"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Making (₹)</label>
                  <input
                    type="number"
                    value={formData.attributes.making_charge_value}
                    onChange={(e) => handleAttrChange("making_charge_value", e.target.value)}
                    placeholder="500"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold font-display rounded-xl text-xs shadow-md transition"
            >
              {productToEdit ? "Save Changes" : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
