import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import { AddEditProductModal } from "./AddEditProductModal";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Boxes,
  X,
} from "lucide-react";

export const InventoryList = () => {
  const { products, deleteProduct, updateProduct, activeVertical } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // In-App Quick Refill Modal State (replaces native browser prompt)
  const [refillTarget, setRefillTarget] = useState(null);
  const [refillQty, setRefillQty] = useState(10);

  // Statistics
  const totalItems = products.length;
  const lowStockItems = products.filter(
    (p) => p.stock !== null && p.stock <= (p.minStockWarning || 5) && p.stock > 0
  );
  const outOfStockItems = products.filter((p) => p.stock !== null && p.stock <= 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + (p.costPrice || p.retailPrice * 0.8) * (p.stock || 0),
    0
  );

  const filteredProducts = products.filter((p) => {
    const matchesVertical =
      activeVertical === "all" || p.vertical === activeVertical;

    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)) ||
      (p.hsn && p.hsn.includes(search));

    const matchesCat =
      categoryFilter === "All" || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = p.stock !== null && p.stock <= (p.minStockWarning || 5) && p.stock > 0;
    } else if (stockFilter === "out") {
      matchesStock = p.stock !== null && p.stock <= 0;
    }

    return matchesVertical && matchesSearch && matchesCat && matchesStock;
  });

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const handleConfirmRefill = (e) => {
    e.preventDefault();
    if (!refillTarget || isNaN(refillQty) || Number(refillQty) <= 0) return;
    const updatedStock = (refillTarget.stock || 0) + Number(refillQty);
    updateProduct(refillTarget.id, { stock: updatedStock });
    setRefillTarget(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from Kirana inventory?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-zinc-900">
      {/* Top Inventory Ledger Summary Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-zinc-950 tracking-tight">
                Stock & Inventory Ledger
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Real-time stock valuation & replenishment control
              </p>
            </div>
          </div>
        </div>

        {/* Counter Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          <div className="bg-zinc-50 border border-zinc-200/80 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Total Items</p>
            <p className="text-base font-bold font-mono text-zinc-950 tabular-nums">{totalItems}</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200/80 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-amber-600 font-mono uppercase font-semibold">Low Stock</p>
            <p className="text-base font-bold font-mono text-amber-700 tabular-nums">{lowStockItems.length}</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200/80 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-red-600 font-mono uppercase font-semibold">Out of Stock</p>
            <p className="text-base font-bold font-mono text-red-600 tabular-nums">{outOfStockItems.length}</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200/80 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-emerald-600 font-mono uppercase font-semibold">Stock Value</p>
            <p className="text-base font-bold font-mono text-emerald-700 tabular-nums">
              ₹{Math.round(totalInventoryValue).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 w-full md:w-auto cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filter & Search Rail */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, barcode, or HSN code..."
              className="w-full bg-white text-zinc-900 text-xs font-medium pl-10 pr-3 py-2.5 rounded-lg border border-zinc-200 outline-none focus:border-zinc-950 transition placeholder-zinc-400"
            />
          </div>

          {/* Stock Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                stockFilter === "all" ? "bg-white text-zinc-950 font-semibold shadow-2xs" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setStockFilter("low")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                stockFilter === "low" ? "bg-white text-amber-800 font-semibold shadow-2xs" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Low Stock ({lowStockItems.length})
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                stockFilter === "out" ? "bg-white text-red-700 font-semibold shadow-2xs" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Out of Stock ({outOfStockItems.length})
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-zinc-100">
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 text-white font-semibold"
                    : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950 border border-zinc-200/60"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Item Description</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold text-right">Retail Price</th>
                <th className="px-4 py-3 font-semibold text-center">GST Rate</th>
                <th className="px-4 py-3 font-semibold text-right">Current Stock</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-400">
                    <Package className="w-9 h-9 mx-auto mb-2 text-zinc-300 stroke-[1.5]" />
                    <p className="font-semibold text-zinc-700 text-sm">No products found</p>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">Try searching with a different term</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock !== null && p.stock <= 0;
                  const isLowStock =
                    p.stock !== null &&
                    p.stock > 0 &&
                    p.stock <= (p.minStockWarning || 5);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-950 text-xs">{p.name}</div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                          {p.barcode ? `Barcode: ${p.barcode}` : "No Barcode"} {p.hsn ? `· HSN: ${p.hsn}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-zinc-100 text-zinc-700 font-medium px-2 py-0.5 rounded text-[10px] border border-zinc-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-zinc-950 text-xs tabular-nums">
                        ₹{p.retailPrice.toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-zinc-400 ml-0.5">/{p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-zinc-600">
                        {p.gst}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold font-mono text-xs tabular-nums flex items-center justify-end gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOutOfStock
                                ? "bg-red-500"
                                : isLowStock
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className={isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-700" : "text-zinc-900"}>
                            {p.stock} {p.unit}
                          </span>
                        </div>
                        {isLowStock && (
                          <span className="text-[9px] font-mono font-semibold text-amber-700 block mt-0.5">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRefillTarget(p);
                              setRefillQty(10);
                            }}
                            title="Quick Refill Stock"
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setModalOpen(true);
                            }}
                            title="Edit Product"
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete Product"
                            className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Quick Refill Stock Modal (Replaces native browser prompt) */}
      {refillTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setRefillTarget(null)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-zinc-800" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Quick Refill Stock
                </h3>
              </div>
              <button
                onClick={() => setRefillTarget(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-900 truncate">
                {refillTarget.name}
              </p>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Current Stock: <strong className="text-zinc-900">{refillTarget.stock} {refillTarget.unit}</strong>
              </p>
            </div>

            {/* Quick Refill Increment Buttons */}
            <div className="flex items-center gap-1.5">
              {[5, 10, 25, 50, 100].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setRefillQty(inc)}
                  className={`flex-1 py-1 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                    refillQty === inc
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  +{inc}
                </button>
              ))}
            </div>

            <form onSubmit={handleConfirmRefill} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  Quantity to Add ({refillTarget.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={refillQty}
                  onChange={(e) => setRefillQty(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 focus:border-zinc-950 rounded-lg px-3 py-2 text-sm font-mono font-bold text-zinc-950 outline-none"
                />
              </div>

              {/* Preview resulting stock */}
              <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 text-xs font-mono flex justify-between">
                <span className="text-zinc-500">Updated Total Stock:</span>
                <span className="font-bold text-emerald-700">
                  {(refillTarget.stock || 0) + (Number(refillQty) || 0)} {refillTarget.unit}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRefillTarget(null)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AddEditProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
};
