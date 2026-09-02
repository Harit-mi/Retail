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
    const addQty = prompt(`Refill stock for "${product.name}". Enter quantity to add:`, "10");
    if (addQty && !isNaN(addQty)) {
      const updatedStock = (product.stock || 0) + Number(addQty);
      updateProduct(product.id, { stock: updatedStock });
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from Kirana inventory?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Till Register Summary Bar */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#F5A623]" />
            <span>Kirana Inventory Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time stock valuation & replenishment control
          </p>
        </div>

        {/* Counter Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Items</p>
            <p className="text-base font-black font-mono text-white tabular-nums">{totalItems}</p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-amber-300 font-mono uppercase font-bold">Low Stock</p>
            <p className="text-base font-black font-mono text-[#F5A623] tabular-nums">{lowStockItems.length}</p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-red-300 font-mono uppercase font-bold">Out of Stock</p>
            <p className="text-base font-black font-mono text-red-400 tabular-nums">{outOfStockItems.length}</p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] text-emerald-300 font-mono uppercase font-bold">Stock Value</p>
            <p className="text-base font-black font-mono text-[#1FAA59] tabular-nums">
              ₹{Math.round(totalInventoryValue).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="px-4 py-3 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black font-display rounded-lg text-xs transition flex items-center justify-center gap-1.5 w-full md:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD NEW ITEM</span>
        </button>
      </div>

      {/* Filter & Search Rail */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, barcode, or HSN code..."
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold pl-10 pr-3 py-3 rounded-lg border-2 border-slate-200 outline-none focus:border-[#1E3A5F] transition"
            />
          </div>

          {/* Stock Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3 py-2 text-xs font-bold rounded transition ${
                stockFilter === "all" ? "bg-[#1E3A5F] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setStockFilter("low")}
              className={`px-3 py-2 text-xs font-bold rounded transition ${
                stockFilter === "low" ? "bg-[#F5A623] text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Low Stock ({lowStockItems.length})
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-3 py-2 text-xs font-bold rounded transition ${
                stockFilter === "out" ? "bg-[#E64545] text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Out of Stock ({outOfStockItems.length})
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-stretch gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1F35] text-white font-mono uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3.5 font-extrabold">Item Description</th>
                <th className="px-4 py-3.5 font-extrabold">Category</th>
                <th className="px-4 py-3.5 font-extrabold text-right">Retail Price</th>
                <th className="px-4 py-3.5 font-extrabold text-center">GST Rate</th>
                <th className="px-4 py-3.5 font-extrabold text-right">Current Stock</th>
                <th className="px-4 py-3.5 font-extrabold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-bold text-slate-700 font-display">No Kirana products found</p>
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
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900 text-sm font-display">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {p.barcode ? `Barcode: ${p.barcode}` : "No Barcode"} {p.hsn ? `· HSN: ${p.hsn}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded text-[10px] border border-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black font-mono text-[#1E3A5F] text-sm tabular-nums">
                        ₹{p.retailPrice.toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-slate-400">/{p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-600">
                        {p.gst}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-black font-mono text-sm tabular-nums">
                          {isOutOfStock ? (
                            <span className="text-[#E64545]">0 {p.unit}</span>
                          ) : isLowStock ? (
                            <span className="text-[#F5A623]">{p.stock} {p.unit}</span>
                          ) : (
                            <span className="text-slate-900">{p.stock} {p.unit}</span>
                          )}
                        </div>
                        {isLowStock && (
                          <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleRefillStock(p)}
                            title="Quick Refill Stock"
                            className="p-1.5 bg-emerald-50 text-[#1FAA59] hover:bg-emerald-100 rounded transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setModalOpen(true);
                            }}
                            title="Edit Product"
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete Product"
                            className="p-1.5 bg-red-50 text-[#E64545] hover:bg-red-100 rounded transition"
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
