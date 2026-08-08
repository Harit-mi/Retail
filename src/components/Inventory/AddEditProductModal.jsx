import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Save, Sparkles, Tag, CheckCircle } from "lucide-react";

export const AddEditProductModal = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, storeConfig } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "General Kirana",
    hsn: "",
    gst: 5,
    retailPrice: "",
    wholesalePrice: "",
    costPrice: "",
    stock: 10,
    unit: "Pcs",
    mode: storeConfig.mode || "kirana",
    size: "",
    brand: "",
    color: "",
    minStockWarning: 5,
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
        mode: productToEdit.mode || storeConfig.mode,
        size: productToEdit.size || "",
        brand: productToEdit.brand || "",
        color: productToEdit.color || "",
        minStockWarning: productToEdit.minStockWarning || 5,
      });
    } else {
      setFormData({
        name: "",
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        category: storeConfig.mode === "clothing" ? "Apparel" : "Kirana & Grocery",
        hsn: storeConfig.mode === "clothing" ? "6205" : "1902",
        gst: 5,
        retailPrice: "",
        wholesalePrice: "",
        costPrice: "",
        stock: 20,
        unit: "Pcs",
        mode: storeConfig.mode || "kirana",
        size: "",
        brand: "",
        color: "",
        minStockWarning: 5,
      });
    }
  }, [productToEdit, isOpen, storeConfig.mode]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col card-shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-extrabold text-slate-900 font-display text-base flex items-center space-x-2">
            <span>{productToEdit ? "Edit Product Details" : "Add New Inventory Item"}</span>
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
          {/* Mode Switch inside form */}
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-bold">Item Type:</span>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, mode: "kirana" }))}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                formData.mode === "kirana"
                  ? "bg-[#1E3A5F] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kirana / Grocery
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, mode: "clothing" }))}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                formData.mode === "clothing"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Apparel / Fashion
            </button>
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
              placeholder="e.g. Aashirvaad Atta 5kg or Cotton Formal Shirt"
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
                placeholder="Edible Oils, Men Wear..."
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
                placeholder="e.g. 1902"
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
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
            </div>
          </div>

          {/* Prices Row: Retail Price, Wholesale Price, Cost Price */}
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
                Wholesale Price (₹)
              </label>
              <input
                type="number"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                placeholder="130"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Cost Price (₹)
              </label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="115"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Stock & Unit Row */}
          <div className="grid grid-cols-3 gap-3">
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
                Measuring Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
              >
                <option value="Pcs">Pcs / Pieces</option>
                <option value="Pack">Pack</option>
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Gram)</option>
                <option value="Ltr">Ltr (Litre)</option>
                <option value="Set">Set</option>
                <option value="Box">Box</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Low Stock Alert At
              </label>
              <input
                type="number"
                value={formData.minStockWarning}
                onChange={(e) =>
                  setFormData({ ...formData, minStockWarning: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Apparel Specific Fields if Clothing Mode */}
          {formData.mode === "clothing" && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-3">
              <h5 className="text-xs font-extrabold text-indigo-900 font-display uppercase tracking-wider">
                Apparel & Fashion Attributes
              </h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="M, L, XL, 32"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Levi's, Biba"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Navy Blue, Red"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
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
