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
  const { products, deleteProduct, updateProduct, activeVertical } = useStore();
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
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Total Catalog Items
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{totalItems}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Low Stock Warning
            </p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              {lowStockItems.length}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Out of Stock
            </p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">
              {outOfStockItems.length}
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Est. Stock Valuation
            </p>
            <h3 className="text-2xl font-black text-teal-400 mt-1">
              ₹{Math.round(totalInventoryValue).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Inventory Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
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
              className="w-full bg-slate-950 text-white text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Stock & Category Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-800 outline-none"
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
              className="bg-slate-950 text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-800 outline-none"
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
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No items match the criteria
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock !== null && p.stock <= (p.minStockWarning || 5) && p.stock > 0;
                  const isOut = p.stock !== null && p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{p.name}</div>
                        {p.attributes && (
                          <div className="text-[10px] text-indigo-300 space-x-1.5 mt-0.5">
                            {p.attributes.batch_no && <span>Batch: {p.attributes.batch_no}</span>}
                            {p.attributes.size && <span>• Size: {p.attributes.size}</span>}
                            {p.attributes.purity && <span>• {p.attributes.purity}</span>}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 capitalize">
                          {p.category} ({p.vertical || "kirana"})
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {p.hsn && <div>HSN: {p.hsn}</div>}
                        {p.barcode && <div className="text-[10px] text-slate-500">BC: {p.barcode}</div>}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-emerald-400 text-sm">
                        ₹{p.retailPrice.toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-slate-400">
                          /{p.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-teal-400">
                        {p.gst}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.stock === null ? (
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Service Slot
                          </span>
                        ) : isOut ? (
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Low ({p.stock})
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                            {p.stock} {p.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {p.stock !== null && (
                            <button
                              onClick={() => handleRefillStock(p)}
                              title="Refill Stock Quantity"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setModalOpen(true);
                            }}
                            title="Edit Item Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete product "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Delete Item"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
