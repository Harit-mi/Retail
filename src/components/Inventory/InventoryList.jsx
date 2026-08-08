import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { AddEditProductModal } from "./AddEditProductModal";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Tag,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

export const InventoryList = () => {
  const { products, deleteProduct, updateProduct, activeVertical, t } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const handleRefillStock = (product) => {
    const qty = prompt(`Refill stock for "${product.name}": Enter quantity to add`, "20");
    if (qty && !isNaN(qty)) {
      updateProduct(product.id, { stock: (product.stock || 0) + Number(qty) });
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Stat Cards in Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Total Catalog Items
            </p>
            <h3 className="text-2xl font-black font-mono text-slate-900 mt-1">{totalItems}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-[#1FAA59] border border-emerald-100 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Low Stock Warning
            </p>
            <h3 className="text-2xl font-black font-mono text-[#F5A623] mt-1">
              {lowStockItems.length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-[#F5A623] border border-amber-100 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Out of Stock
            </p>
            <h3 className="text-2xl font-black font-mono text-[#E64545] mt-1">
              {outOfStockItems.length}
            </h3>
          </div>
          <div className="p-3 bg-red-50 text-[#E64545] border border-red-100 rounded-2xl">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-display">
              Est. Stock Valuation
            </p>
            <h3 className="text-2xl font-black font-mono text-[#0EA5A5] mt-1">
              ₹{Math.round(totalInventoryValue).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-teal-50 text-[#0EA5A5] border border-teal-100 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Inventory Panel (Clean Light SaaS Card) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 card-shadow">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, barcode, HSN..."
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#1E3A5F] focus:bg-white transition"
            />
          </div>

          {/* Stock & Category Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Stock: All</option>
              <option value="low">Stock: Low Warning</option>
              <option value="out">Stock: Out of Stock</option>
            </select>

            <button
              onClick={() => {
                setEditingProduct(null);
                setModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4 text-[#F5A623]" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Product Table - Clean High-Contrast Light Styling */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category / Vertical</th>
                <th className="py-3.5 px-4">HSN / Barcode</th>
                <th className="py-3.5 px-4 text-right">Retail Price</th>
                <th className="py-3.5 px-4 text-center">GST %</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    No items match the search filter criteria
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock !== null && p.stock <= (p.minStockWarning || 5) && p.stock > 0;
                  const isOut = p.stock !== null && p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-xs font-display">{p.name}</div>
                        {p.attributes && (
                          <div className="text-[10px] text-indigo-700 font-mono space-x-1.5 mt-0.5">
                            {p.attributes.batch_no && <span>Batch: {p.attributes.batch_no}</span>}
                            {p.attributes.size && <span>• Size: {p.attributes.size}</span>}
                            {p.attributes.purity && <span>• {p.attributes.purity}</span>}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-bold capitalize">
                          {p.category} ({p.vertical || "kirana"})
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {p.hsn && <div>HSN: {p.hsn}</div>}
                        {p.barcode && <div className="text-[10px] text-slate-400">BC: {p.barcode}</div>}
                      </td>

                      <td className="py-3 px-4 text-right font-black font-mono text-[#1FAA59] text-sm">
                        ₹{p.retailPrice.toLocaleString("en-IN")}
                        <span className="text-[10px] font-sans font-normal text-slate-400">
                          /{p.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-mono text-teal-700">
                        {p.gst}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.stock === null ? (
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Service Slot
                          </span>
                        ) : isOut ? (
                          <span className="bg-red-50 text-[#E64545] border border-red-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            {t("outOfStock")}
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-50 text-[#F5A623] border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            {t("lowStock")} ({p.stock})
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-[#1FAA59] border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            {p.stock} {p.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {p.stock !== null && (
                            <button
                              onClick={() => handleRefillStock(p)}
                              title="Refill Stock Quantity"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#1FAA59] hover:bg-emerald-50 transition"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setModalOpen(true);
                            }}
                            title="Edit Item Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete product "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Delete Item"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E64545] hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
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
