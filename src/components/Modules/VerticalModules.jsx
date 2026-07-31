import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Pill,
  Shirt,
  Smartphone,
  Scissors,
  Utensils,
  Gem,
  Calculator,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Printer,
  Sparkles,
  ShieldCheck,
  User,
  Layers,
} from "lucide-react";

export const VerticalModules = () => {
  const {
    products,
    storeConfig,
    setStoreConfig,
    kotOrders,
    appointments,
    addAppointment,
    addToCart,
    setActiveTab,
  } = useStore();

  const [activeModuleTab, setActiveModuleTab] = useState("batch"); // 'batch', 'variant', 'imei', 'salon', 'kot', 'jewelry', 'emi'

  // Salon Appointment Form State
  const [aptCustName, setAptCustName] = useState("");
  const [aptPhone, setAptPhone] = useState("");
  const [aptService, setAptService] = useState("Hair Cut & Styling Combo");
  const [aptStaff, setAptStaff] = useState("Priya (Senior Stylist)");
  const [aptTime, setAptTime] = useState("16:00");

  // Jewelry Rate Calc State
  const [jewelWeight, setJewelWeight] = useState(10); // grams
  const [jewelPurity, setJewelPurity] = useState("22K"); // 22K or 18K
  const [makingType, setMakingType] = useState("percent");
  const [makingVal, setMakingVal] = useState(8);

  const goldRate = storeConfig.liveGoldRate22K || 6850;

  // FEFO (First-Expiry-First-Out) products
  const pharmacyProducts = products.filter((p) => p.attributes?.expiry_date);

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!aptCustName || !aptPhone) return;

    addAppointment({
      customerName: aptCustName,
      phone: aptPhone,
      serviceName: aptService,
      staffName: aptStaff,
      date: new Date().toISOString().split("T")[0],
      time: aptTime,
    });

    setAptCustName("");
    setAptPhone("");
    alert("Appointment Booked Successfully!");
  };

  // Jewelry Price Math
  let metalPrice = jewelWeight * (jewelPurity === "22K" ? goldRate : goldRate * 0.82);
  let makingChargeAmt =
    makingType === "percent" ? (metalPrice * makingVal) / 100 : jewelWeight * makingVal;
  let totalJewelEst = metalPrice + makingChargeAmt;
  const requiresKYC = totalJewelEst >= 200000;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Selector Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-white text-lg flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Pluggable Vertical Business Modules</span>
          </h2>
          <p className="text-xs text-slate-400">
            Specialized workflows for Pharmacy, Salon, Restaurant KOT, Electronics IMEI & Jewelry
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "batch", label: "Batch & Expiry (Pharmacy)", icon: Pill, color: "text-rose-400" },
          { id: "variant", label: "Variant Matrix (Apparel)", icon: Shirt, color: "text-indigo-400" },
          { id: "imei", label: "IMEI & Warranty (Electronics)", icon: Smartphone, color: "text-blue-400" },
          { id: "salon", label: "Salon & Appointments", icon: Scissors, color: "text-purple-400" },
          { id: "kot", label: "Table & KOT (Restaurant)", icon: Utensils, color: "text-amber-400" },
          { id: "jewelry", label: "Gold Rate & Jewelry", icon: Gem, color: "text-yellow-400" },
          { id: "emi", label: "EMI & Finance Calculator", icon: Calculator, color: "text-teal-400" },
        ].map((mod) => {
          const Icon = mod.icon;
          const isSelected = activeModuleTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModuleTab(mod.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? "bg-slate-800 border-emerald-500 text-white shadow-lg"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${mod.color}`} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODULE CONTENT PANELS */}

      {/* 1. BATCH & EXPIRY MODULE (Pharmacy & Grocery) */}
      {activeModuleTab === "batch" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Pill className="w-5 h-5 text-rose-400" />
                <span>Pharmacy Batch & Expiry Tracker (FEFO Engine)</span>
              </h3>
              <p className="text-xs text-slate-400">
                First-Expiry-First-Out stock recommendation & Schedule H Drug flags
              </p>
            </div>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full font-bold border border-rose-500/30">
              {pharmacyProducts.length} Batches Tracked
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Medicine / Product</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Drug Schedule</th>
                  <th className="py-3 px-4 text-center">Prescription Flag</th>
                  <th className="py-3 px-4 text-center">FEFO Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {pharmacyProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">
                      {p.attributes?.batch_no || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-300 font-bold">
                      {p.attributes?.expiry_date || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                        {p.attributes?.drug_schedule || "OTC"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.attributes?.requires_prescription ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          Rx Mandatory
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">OTC Free</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-400">
                      {p.stock} {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VARIANT MATRIX MODULE (Clothing & Footwear) */}
      {activeModuleTab === "variant" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Shirt className="w-5 h-5 text-indigo-400" />
                <span>Apparel Size × Color Matrix Grid</span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-attribute SKU management for clothing boutiques & footwear
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.selling_unit_type === "variant_matrix" || p.attributes?.size)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-xs">{p.name}</h4>
                    <span className="text-emerald-400 font-black text-xs">
                      ₹{p.retailPrice}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                      Size: {p.attributes?.size || "M"}
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Color: {p.attributes?.color || "Default"}
                    </span>
                    <span className="text-slate-400">Brand: {p.attributes?.brand}</span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      setActiveTab("pos");
                    }}
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    + Add Variant to POS Bill
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. SERIAL / IMEI & WARRANTY MODULE (Electronics) */}
      {activeModuleTab === "imei" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span>Serial / IMEI & Warranty Tracking</span>
              </h3>
              <p className="text-xs text-slate-400">
                Single-unit serial number logging, warranty periods & service tickets
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {products
              .filter((p) => p.attributes?.imei || p.attributes?.serial_no)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>
                        IMEI:{" "}
                        <strong className="font-mono text-blue-400">
                          {p.attributes?.imei}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Serial:{" "}
                        <strong className="font-mono text-slate-200">
                          {p.attributes?.serial_no}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      {p.attributes?.warranty_months} Months Warranty
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. SALON & APPOINTMENTS MODULE */}
      {activeModuleTab === "salon" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Booking Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-purple-400" />
              <span>Book Salon Appointment</span>
            </h3>

            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={aptCustName}
                  onChange={(e) => setAptCustName(e.target.value)}
                  placeholder="e.g. Megha Roy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={aptPhone}
                  onChange={(e) => setAptPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Service Package
                </label>
                <select
                  value={aptService}
                  onChange={(e) => setAptService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Hair Cut & Styling Combo">Hair Cut & Styling Combo (₹650)</option>
                  <option value="Facial & Skin Care Package">Facial & Skin Care Package (₹1200)</option>
                  <option value="Spa Pedicure & Manicure">Spa Pedicure & Manicure (₹850)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Assigned Stylist / Staff
                </label>
                <select
                  value={aptStaff}
                  onChange={(e) => setAptStaff(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Priya (Senior Stylist)">Priya (Senior Stylist - 20% Comm)</option>
                  <option value="Rahul (Hair Specialist)">Rahul (Hair Specialist - 15% Comm)</option>
                  <option value="Kavita (Beauty Expert)">Kavita (Beauty Expert - 18% Comm)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
              >
                Confirm Appointment Slot
              </button>
            </form>
          </div>

          {/* Right Appointment Slot Bookings */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-white text-base">
              Today's Appointment Schedule & Staff Slots
            </h3>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {apt.customerName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Service: <strong className="text-purple-300">{apt.serviceName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Stylist: {apt.staffName} • {apt.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      Slot: {apt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLE MANAGEMENT & KOT MODULE (Restaurant) */}
      {activeModuleTab === "kot" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <span>Live Table Layout & Kitchen Order Tickets (KOT)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage Dine-in, Takeaway, and instant KOT prints to kitchen displays
              </p>
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tNo) => {
              const isOccupied = tNo === 2 || tNo === 4;
              return (
                <div
                  key={tNo}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isOccupied
                      ? "bg-amber-950/40 border-amber-500 text-amber-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60"
                  }`}
                >
                  <Utensils className="w-6 h-6 mb-1" />
                  <span className="text-sm font-extrabold">Table #{tNo}</span>
                  <span className="text-[10px] mt-1">
                    {isOccupied ? "Occupied (Bill Active)" : "Vacant"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. GOLD RATE & JEWELRY MODULE */}
      {activeModuleTab === "jewelry" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <Gem className="w-5 h-5 text-yellow-400" />
                <span>Jewelry Weight, Purity & Live Metal Rate Engine</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live Gold 22K rate feed: <strong>₹{goldRate}/g</strong> • BIS Hallmark & PAN KYC Compliance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Live Calculator */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Custom Ornament Price Estimator
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Gross Weight (Grams)
                  </label>
                  <input
                    type="number"
                    value={jewelWeight}
                    onChange={(e) => setJewelWeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Purity Rating
                  </label>
                  <select
                    value={jewelPurity}
                    onChange={(e) => setJewelPurity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-yellow-400 font-bold outline-none"
                  >
                    <option value="22K">22K Gold (91.6% Pure)</option>
                    <option value="18K">18K Gold (75.0% Pure)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Making Charge Type
                  </label>
                  <select
                    value={makingType}
                    onChange={(e) => setMakingType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="percent">% of Gold Value</option>
                    <option value="flat">₹ per Gram</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Making Charge Value
                  </label>
                  <input
                    type="number"
                    value={makingVal}
                    onChange={(e) => setMakingVal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Price Calculation Output Box */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Gold Value:</span>
                  <span>₹{Math.round(metalPrice).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Making Charges:</span>
                  <span>₹{Math.round(makingChargeAmt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-black text-yellow-400 pt-2 border-t border-yellow-500/30">
                  <span>Estimated Total (Ex. GST 3%):</span>
                  <span>₹{Math.round(totalJewelEst).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {requiresKYC && (
                <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>
                    <strong>KYC Alert:</strong> Invoice value exceeds ₹2,000,000. Customer PAN card capture required by Indian Tax Regulations.
                  </span>
                </div>
              )}
            </div>

            {/* Existing Stock items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">
                Jewelry Stock Inventory
              </h4>

              {products
                .filter((p) => p.vertical === "jewelry" || p.attributes?.purity)
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{p.name}</h5>
                      <p className="text-[11px] text-yellow-400 font-semibold mt-0.5">
                        {p.attributes?.purity} • Net Wt: {p.attributes?.net_weight}g
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        BIS Hallmark: {p.attributes?.hallmark_no}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">
                        ₹{p.retailPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. EMI & FINANCE CALCULATOR MODULE */}
      {activeModuleTab === "emi" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-teal-400" />
            <span>Bajaj Finserv & Partner EMI Installment Calculator</span>
          </h3>
          <p className="text-xs text-slate-400">
            Generate zero-cost or flexible monthly installment billing for Electronics, Mobile, and High-value Purchases
          </p>
        </div>
      )}
    </div>
  );
};
