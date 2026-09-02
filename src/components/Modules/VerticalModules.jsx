import React, { useState } from "react";
import { useStore } from "../../context/useStore";

export const VerticalModules = () => {
  const {
    products,
    storeConfig,
    appointments,
    addAppointment,
    addToCart,
    setActiveTab,
  } = useStore();

  const [activeModuleTab, setActiveModuleTab] = useState("batch");

  // Salon Appointment Form State
  const [aptCustName, setAptCustName] = useState("");
  const [aptPhone, setAptPhone] = useState("");
  const [aptService, setAptService] = useState("Hair Cut & Styling Combo");
  const [aptStaff, setAptStaff] = useState("Priya (Senior Stylist)");
  const [aptTime] = useState("16:00");

  // Jewelry Rate Calc State
  const [jewelWeight, setJewelWeight] = useState(10);
  const [jewelPurity, setJewelPurity] = useState("22K");
  const [makingType] = useState("percent");
  const [makingVal] = useState(8);

  const goldRate = storeConfig.liveGoldRate22K || 6850;
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

  let metalPrice = jewelWeight * (jewelPurity === "22K" ? goldRate : goldRate * 0.82);
  let makingChargeAmt =
    makingType === "percent" ? (metalPrice * makingVal) / 100 : jewelWeight * makingVal;
  let totalJewelEst = metalPrice + makingChargeAmt;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Selector Banner with FontAwesome Icon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 card-shadow flex items-center justify-between">
        <div>
          <h2 className="font-extrabold font-display text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-cubes text-[#1E3A5F]"></i>
            <span>Pluggable Vertical Business Modules</span>
          </h2>
          <p className="text-xs text-slate-500">
            Specialized workflows with FontAwesome 6 symbol integration
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "batch", label: "Batch & Expiry (Pharmacy)", iconClass: "fa-solid fa-prescription-bottle-medical", color: "text-[#E64545]" },
          { id: "variant", label: "Variant Matrix (Apparel)", iconClass: "fa-solid fa-shirt", color: "text-[#1E3A5F]" },
          { id: "imei", label: "IMEI & Warranty (Electronics)", iconClass: "fa-solid fa-mobile-screen-button", color: "text-blue-600" },
          { id: "salon", label: "Salon & Appointments", iconClass: "fa-solid fa-scissors", color: "text-purple-600" },
          { id: "kot", label: "Table & KOT (Restaurant)", iconClass: "fa-solid fa-utensils", color: "text-amber-600" },
          { id: "jewelry", label: "Gold Rate & Jewelry", iconClass: "fa-solid fa-gem", color: "text-yellow-600" },
          { id: "emi", label: "EMI & Finance Calculator", iconClass: "fa-solid fa-calculator", color: "text-[#0EA5A5]" },
        ].map((mod) => {
          const isSelected = activeModuleTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModuleTab(mod.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <i className={`${mod.iconClass} text-sm ${isSelected ? "text-[#F5A623]" : mod.color}`}></i>
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. BATCH & EXPIRY MODULE */}
      {activeModuleTab === "batch" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 card-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
                <i className="fa-solid fa-prescription-bottle-medical text-[#E64545]"></i>
                <span>Pharmacy Batch & Expiry Tracker (FEFO Engine)</span>
              </h3>
              <p className="text-xs text-slate-500">
                First-Expiry-First-Out stock recommendation & Schedule H Drug flags
              </p>
            </div>
            <span className="text-xs bg-red-50 text-[#E64545] px-3 py-1 rounded-full font-bold border border-red-200">
              {pharmacyProducts.length} Batches Tracked
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Medicine / Product</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Drug Schedule</th>
                  <th className="py-3 px-4 text-center">Prescription Flag</th>
                  <th className="py-3 px-4 text-center">FEFO Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmacyProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-[#1E3A5F] font-semibold">
                      {p.attributes?.batch_no || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-mono text-red-600 font-bold">
                      {p.attributes?.expiry_date || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.attributes?.drug_schedule || "OTC"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.attributes?.requires_prescription ? (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          <i className="fa-solid fa-file-prescription mr-1"></i>
                          Rx Mandatory
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">OTC Free</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#1FAA59]">
                      {p.stock} {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VARIANT MATRIX MODULE */}
      {activeModuleTab === "variant" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 card-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
                <i className="fa-solid fa-shirt text-[#1E3A5F]"></i>
                <span>Apparel Size × Color Matrix Grid</span>
              </h3>
              <p className="text-xs text-slate-500">
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
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-xs font-display">{p.name}</h4>
                    <span className="text-[#1FAA59] font-black font-mono text-xs">
                      ₹{p.retailPrice}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                    <span className="bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded font-mono font-bold">
                      Size: {p.attributes?.size || "M"}
                    </span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded font-medium">
                      Color: {p.attributes?.color || "Default"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      setActiveTab("pos");
                    }}
                    className="w-full mt-2 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span>Add Variant to POS Cart</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. SERIAL / IMEI MODULE */}
      {activeModuleTab === "imei" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 card-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
                <i className="fa-solid fa-mobile-screen-button text-blue-600"></i>
                <span>Serial / IMEI & Warranty Tracking</span>
              </h3>
              <p className="text-xs text-slate-500">
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
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-display">{p.name}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                      <span>
                        IMEI:{" "}
                        <strong className="font-mono text-blue-700">
                          {p.attributes?.imei}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Serial:{" "}
                        <strong className="font-mono text-slate-800">
                          {p.attributes?.serial_no}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                      <i className="fa-solid fa-shield-halved mr-1"></i>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 card-shadow">
            <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
              <i className="fa-solid fa-scissors text-purple-600"></i>
              <span>Book Salon Appointment</span>
            </h3>

            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={aptCustName}
                  onChange={(e) => setAptCustName(e.target.value)}
                  placeholder="e.g. Megha Roy"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={aptPhone}
                  onChange={(e) => setAptPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Service Package
                </label>
                <select
                  value={aptService}
                  onChange={(e) => setAptService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="Hair Cut & Styling Combo">Hair Cut & Styling Combo (₹650)</option>
                  <option value="Facial & Skin Care Package">Facial & Skin Care Package (₹1200)</option>
                  <option value="Spa Pedicure & Manicure">Spa Pedicure & Manicure (₹850)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                  Assigned Stylist / Staff
                </label>
                <select
                  value={aptStaff}
                  onChange={(e) => setAptStaff(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="Priya (Senior Stylist)">Priya (Senior Stylist - 20% Comm)</option>
                  <option value="Rahul (Hair Specialist)">Rahul (Hair Specialist - 15% Comm)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>Confirm Appointment Slot</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 card-shadow">
            <h3 className="font-extrabold font-display text-slate-900 text-base">
              Today's Appointment Schedule & Staff Slots
            </h3>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-display">
                      {apt.customerName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Service: <strong className="text-purple-700">{apt.serviceName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Stylist: {apt.staffName} • {apt.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold font-mono">
                      Slot: {apt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. RESTAURANT & KOT MODULE */}
      {activeModuleTab === "kot" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 card-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
                <i className="fa-solid fa-utensils text-amber-600"></i>
                <span>Live Table Layout & Kitchen Order Tickets (KOT)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage Dine-in, Takeaway, and instant KOT prints to kitchen displays
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tNo) => {
              const isOccupied = tNo === 2 || tNo === 4;
              return (
                <div
                  key={tNo}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isOccupied
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <i className="fa-solid fa-[#F5A623] fa-utensils text-xl mb-2"></i>
                  <span className="text-sm font-extrabold font-display">Table #{tNo}</span>
                  <span className="text-[10px] mt-1 font-bold">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 card-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-base flex items-center space-x-2">
                <i className="fa-solid fa-gem text-yellow-600"></i>
                <span>Jewelry Weight, Purity & Live Metal Rate Engine</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live Gold 22K rate feed: <strong>₹{goldRate}/g</strong> • BIS Hallmark & PAN KYC Compliance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 font-display uppercase tracking-wider">
                Custom Ornament Price Estimator
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Gross Weight (Grams)
                  </label>
                  <input
                    type="number"
                    value={jewelWeight}
                    onChange={(e) => setJewelWeight(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Purity Rating
                  </label>
                  <select
                    value={jewelPurity}
                    onChange={(e) => setJewelPurity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="22K">22K Gold (91.6% Pure)</option>
                    <option value="18K">18K Gold (75.0% Pure)</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Base Gold Value:</span>
                  <span className="font-mono font-bold">₹{Math.round(metalPrice).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Making Charges:</span>
                  <span className="font-mono font-bold">₹{Math.round(makingChargeAmt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-black font-mono text-slate-900 pt-2 border-t border-amber-200">
                  <span>Estimated Total:</span>
                  <span>₹{Math.round(totalJewelEst).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 font-display">
                Jewelry Stock Inventory
              </h4>

              {products
                .filter((p) => p.vertical === "jewelry" || p.attributes?.purity)
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 font-display">{p.name}</h5>
                      <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                        {p.attributes?.purity} • Net Wt: {p.attributes?.net_weight}g
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-[#1FAA59]">
                        ₹{p.retailPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
