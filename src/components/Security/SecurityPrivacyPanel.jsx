import React, { useState } from "react";
import { useStore } from "../../context/useStore";
import {
  ShieldCheck,
  Lock,
  CheckCircle,
  Trash2,
  Key,
  Download,
  Upload,
  RefreshCw,
  Users,
  UserPlus,
  Edit2,
  Power,
} from "lucide-react";
import { createEncryptedBackup, verifyAndDecryptBackup, downloadBackupFile } from "../../utils/backupRestore";
import { SYSTEM_PANELS } from "../../data/sampleData";

export const SecurityPrivacyPanel = () => {
  const {
    storeConfig,
    setStoreConfig,
    products,
    setProducts,
    customers,
    setCustomers,
    suppliers,
    purchaseOrders,
    sales,
    setSales,
    deleteCustomer,
    lockCounter,
    counterPin,
    updateCounterPin,
    syncOutbox = [],
    syncToCloud,
    restoreStoreBundle,
    users = [],
    currentUser,
    addUser,
    updateUser,
    deleteUser,
  } = useStore();
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'overview', 'pin', 'policy', 'dpo', 'backup'
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState(null);
  const [selectedCustomerIdToDelete, setSelectedCustomerIdToDelete] = useState("");
  const [deletionSuccess, setDeletionSuccess] = useState(null);
  const [grievanceType, setGrievanceType] = useState("erasure");
  const [grievanceText, setGrievanceText] = useState("");
  const [grievanceSuccess, setGrievanceSuccess] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);
  const [restorePin, setRestorePin] = useState("");

  // User Management State (RBAC)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    passcode: "",
    role: "user",
    allowedPanels: ["pos", "khata", "barcodes"],
  });
  const [userActionMsg, setUserActionMsg] = useState(null);

  // User Management Handlers (RBAC)
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: "",
      username: "",
      passcode: "",
      role: "user",
      allowedPanels: ["pos", "khata", "barcodes"],
    });
    setUserActionMsg(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      username: user.username,
      passcode: user.passcode,
      role: user.role,
      allowedPanels: user.allowedPanels || [],
    });
    setUserActionMsg(null);
    setUserModalOpen(true);
  };

  const handleTogglePanel = (panelId) => {
    setUserForm((prev) => {
      const exists = prev.allowedPanels.includes(panelId);
      const updated = exists
        ? prev.allowedPanels.filter((id) => id !== panelId)
        : [...prev.allowedPanels, panelId];
      return { ...prev, allowedPanels: updated };
    });
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.username.trim()) {
      setUserActionMsg({ type: "error", text: "Username is required." });
      return;
    }
    if (!userForm.passcode || userForm.passcode.length < 4) {
      setUserActionMsg({ type: "error", text: "Passcode / PIN must be at least 4 digits or characters." });
      return;
    }
    if (userForm.role === "user" && userForm.allowedPanels.length === 0) {
      setUserActionMsg({ type: "error", text: "Please grant access to at least 1 panel." });
      return;
    }

    if (editingUserId) {
      const res = updateUser(editingUserId, userForm);
      if (res.success) {
        setUserActionMsg({ type: "success", text: res.message });
        setTimeout(() => {
          setUserModalOpen(false);
          setUserActionMsg(null);
        }, 1200);
      } else {
        setUserActionMsg({ type: "error", text: res.message });
      }
    } else {
      const res = addUser(userForm);
      if (res.success) {
        setUserActionMsg({ type: "success", text: res.message });
        setTimeout(() => {
          setUserModalOpen(false);
          setUserActionMsg(null);
        }, 1200);
      } else {
        setUserActionMsg({ type: "error", text: res.message });
      }
    }
  };

  const handleToggleUserStatus = (user) => {
    if (user.role === "admin" && user.status === "active") {
      const adminCount = users.filter((u) => u.role === "admin" && u.status === "active").length;
      if (adminCount <= 1) {
        alert("Cannot deactivate the sole remaining Administrator.");
        return;
      }
    }
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateUser(user.id, { status: newStatus });
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}" (@${user.username})?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const securityPrincipleItems = [
    {
      title: "Realtime Cloud-Synchronized Architecture",
      desc: "All store billing transactions, stock movements, and customer ledgers sync directly with the cloud database while maintaining instant local cache responsiveness.",
      tag: "Cloud Architecture",
      icon: "fa-solid fa-cloud text-[#1E3A5F]",
    },
    {
      title: "India DPDP Act 2023 Compliance",
      desc: "Protects customer data with phone masking (+91 98765 *****) and Section 12 Right-to-Erasure customer deletion.",
      tag: "Privacy Compliance",
      icon: "fa-solid fa-user-shield text-[#1FAA59]",
    },
    {
      title: "GSTR Export Formula Injection Shield",
      desc: "Escapes dangerous spreadsheet characters (=, +, -, @) during GSTR-1/3B CSV file downloads to block RCE vulnerabilities.",
      tag: "Export Defense",
      icon: "fa-solid fa-shield-halved text-teal-600",
    },
    {
      title: "Physical Counter Register PIN Lock",
      desc: "Instant 4-digit screen lock gating the POS counter register to prevent unauthorized access when cashiers step away.",
      tag: "Access Control",
      icon: "fa-solid fa-lock text-amber-600",
    },
  ];

  const handleDeleteCustomer = (e) => {
    e.preventDefault();
    if (!selectedCustomerIdToDelete) return;
    const target = customers.find((c) => c.id === selectedCustomerIdToDelete);
    if (!target) return;

    if (window.confirm(`Are you sure you want to permanently erase all records for ${target.name} under DPDP Right-to-Erasure?`)) {
      deleteCustomer(target.id);
      setDeletionSuccess(`Permanently erased data for ${target.name} (${target.phone}) under DPDP Right-to-Erasure.`);
      setSelectedCustomerIdToDelete("");
      setTimeout(() => setDeletionSuccess(null), 4000);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    const res = await updateCounterPin(newPin);
    setPinMsg(res.message);
    if (res.success) setNewPin("");
    setTimeout(() => setPinMsg(null), 3500);
  };

  const handleFileGrievance = (e) => {
    e.preventDefault();
    if (!grievanceText) return;
    const ticketId = `DPDP-GRV-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    setGrievanceSuccess(`Grievance Ticket #${ticketId} logged to local register audit trail. Provide this ticket reference to your store owner or designated compliance representative for follow-up.`);
    setGrievanceText("");
    setTimeout(() => setGrievanceSuccess(null), 6000);
  };

  const handleExportBackup = async () => {
    try {
      setBackupStatus({ type: "loading", message: "Encrypting store database vault with AES-GCM 256-bit..." });
      const bundle = {
        storeConfig,
        products,
        customers,
        suppliers,
        purchaseOrders,
        sales,
      };
      const encryptedBlob = await createEncryptedBackup(bundle, counterPin);
      downloadBackupFile(encryptedBlob, storeConfig.name || "DukaanPOS");
      setBackupStatus({
        type: "success",
        message: `Vault backup downloaded successfully (${products.length} products, ${customers.length} customers, ${sales.length} invoices).`,
      });
      setTimeout(() => setBackupStatus(null), 6000);
    } catch (err) {
      setBackupStatus({ type: "error", message: `Backup export failed: ${err.message}` });
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const pinToUse = restorePin.trim() || counterPin;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        setBackupStatus({ type: "loading", message: "Verifying backup integrity and decrypting..." });
        const res = await verifyAndDecryptBackup(text, pinToUse);
        if (!res.success) {
          setBackupStatus({ type: "error", message: res.message });
          return;
        }

        const data = res.data;
        if (restoreStoreBundle) {
          restoreStoreBundle(data);
        } else {
          if (data.storeConfig) setStoreConfig(data.storeConfig);
          if (data.products) setProducts(data.products);
          if (data.customers) setCustomers(data.customers);
          if (data.sales) setSales(data.sales);
        }

        setBackupStatus({
          type: "success",
          message: `Restore complete! Recovered ${res.metadata?.stats?.productsCount || data.products.length} products, ${res.metadata?.stats?.customersCount || data.customers.length} customers, ${res.metadata?.stats?.salesCount || data.sales.length} sales from ${res.metadata?.exportDate?.split("T")[0] || "backup"}.`,
        });
        setRestorePin("");
        setTimeout(() => setBackupStatus(null), 8000);
      } catch (err) {
        setBackupStatus({ type: "error", message: `Corrupted file or invalid format: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0F1F35] text-white rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-black font-display tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
            <span>Store Security & DPDP Privacy Center</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Local-first offline encryption, cashier PIN security & DPDP Act 2023 data compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={lockCounter}
            className="px-4 py-2.5 bg-[#F5A623] hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Register Now</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "users" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>👥 Staff & Panel Access (RBAC)</span>
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "overview" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🛡️ Security Overview
        </button>
        <button
          onClick={() => setActiveTab("pin")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "pin" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🔑 Cashier PIN Settings
        </button>
        <button
          onClick={() => setActiveTab("policy")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "policy" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🗑️ Customer Right-to-Erasure
        </button>
        <button
          onClick={() => setActiveTab("dpo")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "dpo" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📜 DPO & Grievance SLA (Sec 13)
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeTab === "backup" ? "bg-[#1E3A5F] text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          💾 Vault Backup & Recovery
        </button>
      </div>

      {backupStatus && (
        <div className={`px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in ${
          backupStatus.type === "error"
            ? "bg-red-50 border border-red-300 text-red-700"
            : backupStatus.type === "loading"
            ? "bg-blue-50 border border-blue-300 text-blue-700"
            : "bg-emerald-50 border border-emerald-300 text-emerald-800"
        }`}>
          <span>{backupStatus.message}</span>
        </div>
      )}

      {deletionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{deletionSuccess}</span>
        </div>
      )}

      {/* Tab 0: Staff & Panel Access (RBAC) */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Top Info & Action Bar */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1E3A5F]" />
                <h3 className="font-extrabold text-sm text-slate-900 font-display">
                  Staff & Role-Based Access Control (RBAC) · कर्मचारी व अधिकार प्रबंधन
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Admin can create users and grant access to specific store panels by ticking permissions. Standard users can login with their credentials and are strictly gated to their allowed panels.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddUser}
              className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-[#F5A623]" />
              <span>+ Add New User (नया ऑपरेटर)</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Users</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">{users.length}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Administrators (Full Access)</span>
              <span className="text-xl font-bold font-mono text-amber-700 mt-0.5 block">
                {users.filter((u) => u.role === "admin" && u.status === "active").length}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Standard Users (Ticked Panels)</span>
              <span className="text-xl font-bold font-mono text-blue-700 mt-0.5 block">
                {users.filter((u) => u.role === "user" && u.status === "active").length}
              </span>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Store Operator Accounts ({users.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Current Active: <strong className="text-slate-900">{currentUser?.name} (@{currentUser?.username})</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-4">Operator / Name</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-4">Ticked Panels Access</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const isCurrent = currentUser?.id === user.id;
                    const isAdmin = user.role === "admin";
                    const isRoot = user.id === "usr_admin";

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#0F1F35] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">Passcode: ••••</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          @{user.username}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            isAdmin
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}>
                            {isAdmin ? "👑 Admin" : "👤 User"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isAdmin ? (
                            <span className="text-[11px] font-mono font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>All 11 Panels (पूर्ण अधिकार)</span>
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(user.allowedPanels || []).map((panelId) => {
                                const pObj = SYSTEM_PANELS.find((p) => p.id === panelId);
                                return (
                                  <span
                                    key={panelId}
                                    className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded"
                                  >
                                    {pObj ? pObj.name.split(" ")[0] : panelId}
                                  </span>
                                );
                              })}
                              <span className="text-[10px] text-slate-400 font-mono self-center">
                                ({(user.allowedPanels || []).length}/11)
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {user.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              title="Edit user details & tick panel permissions"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#1E3A5F] hover:text-white text-slate-700 transition cursor-pointer border border-slate-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={isRoot}
                              title={user.status === "active" ? "Deactivate user" : "Activate user"}
                              className={`p-1.5 rounded-lg transition border cursor-pointer ${
                                isRoot
                                  ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                                  : user.status === "active"
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={isRoot || isCurrent}
                              title={isRoot ? "Cannot delete root admin" : isCurrent ? "Cannot delete logged-in account" : "Delete user account"}
                              className={`p-1.5 rounded-lg transition border ${
                                isRoot || isCurrent
                                  ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                                  : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 cursor-pointer"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal with Tickable Panel Permissions Matrix */}
      {userModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0F1F35] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#F5A623]" />
                <h3 className="font-bold text-sm text-white">
                  {editingUserId ? "Edit Operator & Panel Permissions · अधिकार बदलें" : "Create New Operator · नया ऑपरेटर जोड़ें"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {userActionMsg && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  userActionMsg.type === "error"
                    ? "bg-red-50 text-red-800 border border-red-300"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-300"
                }`}>
                  <span>{userActionMsg.text}</span>
                </div>
              )}

              {/* Name & Username Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Operator Full Name (नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Login Username (यूजरनेम) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ramesh"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              {/* Passcode & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Passcode / PIN (पासकोड) *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength="32"
                    placeholder="Min 4 digits e.g. 5678"
                    value={userForm.passcode}
                    onChange={(e) => setUserForm({ ...userForm, passcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    Used to unlock counter and switch user
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Role Category (भूमिका) *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setUserForm({
                        ...userForm,
                        role: newRole,
                        allowedPanels: newRole === "admin" ? SYSTEM_PANELS.map((p) => p.id) : userForm.allowedPanels,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#1E3A5F]"
                  >
                    <option value="user">👤 User (Operator / पैनल सीमित)</option>
                    <option value="admin">👑 Admin (मालिक / पूर्ण नियंत्रण)</option>
                  </select>
                </div>
              </div>

              {/* Panel Access Checklist (Ticking Panels as per Admin's Wish) */}
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block font-display">
                      Panel Access Permissions (पैनल अधिकार चुनें)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {userForm.role === "admin"
                        ? "Admin accounts have full access to all panels by default."
                        : "Tick or untick panels to grant or revoke access for this operator:"}
                    </span>
                  </div>

                  {userForm.role === "user" && (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, allowedPanels: ["pos", "khata", "barcodes"] })}
                        className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                      >
                        बिलिंग मात्र
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, allowedPanels: ["inventory", "suppliers", "barcodes"] })}
                        className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                      >
                        गोदाम मात्र
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, allowedPanels: SYSTEM_PANELS.map((p) => p.id) })}
                        className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                      >
                        All Panels
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, allowedPanels: [] })}
                        className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-red-600 rounded border border-slate-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Ticking Grid for 11 Panels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
                  {SYSTEM_PANELS.map((panel) => {
                    const isChecked = userForm.role === "admin" || userForm.allowedPanels.includes(panel.id);
                    const disabled = userForm.role === "admin";

                    return (
                      <div
                        key={panel.id}
                        onClick={() => {
                          if (!disabled) handleTogglePanel(panel.id);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition flex items-start gap-2.5 ${
                          disabled
                            ? "bg-slate-50 border-slate-200 opacity-80 cursor-default"
                            : isChecked
                            ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-2xs cursor-pointer"
                            : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={disabled}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 accent-[#1E3A5F] rounded cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-900 leading-tight truncate">
                              {panel.name}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-mono shrink-0">
                              {panel.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 block truncate mt-0.5">
                            {panel.nameHindi}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                >
                  {editingUserId ? "Update Permissions (सहेजें)" : "+ Create User (ऑपरेटर जोड़ें)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 1: Security Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityPrincipleItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs flex items-start space-x-4"
              >
                <div className="p-3 bg-slate-100 rounded-lg">
                  <i className={`${item.icon} text-xl`}></i>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-sm font-display">
                      {item.title}
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div>
              <h5 className="font-extrabold font-display">Test Physical Counter Lock</h5>
              <p className="text-[11px] text-amber-800">Lock the counter to verify the 4-digit cashier PIN prompt works.</p>
            </div>
            <button
              onClick={lockCounter}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-xs whitespace-nowrap"
            >
              Test Register Lock
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Cashier PIN Configuration */}
      {activeTab === "pin" && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs max-w-md">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
              <Key className="w-5 h-5 text-[#1E3A5F]" />
              <span>Configure Cashier Counter Lock PIN</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              PIN Status: <strong className="font-mono text-[#1E3A5F] text-sm bg-slate-100 px-2 py-0.5 rounded">{counterPin ? "Configured (••••)" : "Not Set"}</strong>
            </p>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter New Cashier PIN / Passcode (Min 4 characters)
              </label>
              <input
                type="password"
                maxLength="32"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="PIN or Passphrase (e.g. 5678 or storePass#24)"
                className="w-full bg-slate-50 border-2 border-slate-300 font-mono font-bold text-sm px-3 py-2.5 rounded-lg outline-none focus:border-[#1E3A5F]"
              />
            </div>

            {pinMsg && (
              <p className="text-xs font-bold text-[#1FAA59] bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {pinMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold text-xs rounded-lg shadow transition min-h-[44px]"
            >
              Save New Cashier PIN / Passcode
            </button>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-500 leading-normal">
              <strong className="text-slate-800">Security Recommendation:</strong> A 4-digit PIN provides convenient register screen locking during shift operations. For enhanced cryptographic defense against offline password guessing, a 6–12 digit or alphanumeric passphrase is recommended.
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: DPDP Right-to-Erasure Customer Deletion Panel */}
      {activeTab === "policy" && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs max-w-lg">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#E64545]" />
              <span>DPDP Act 2023 — Right-to-Erasure Data Erasure</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Under Section 12 of India Digital Personal Data Protection Act 2023, customers can request complete deletion of their personal identifier and phone records.
            </p>
          </div>

          <form onSubmit={handleDeleteCustomer} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Customer Account to Erase:
              </label>
              <select
                value={selectedCustomerIdToDelete}
                onChange={(e) => setSelectedCustomerIdToDelete(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — Balance: ₹{c.balance}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedCustomerIdToDelete}
              className="px-5 py-2.5 bg-[#E64545] hover:bg-red-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-2 shadow transition disabled:opacity-50 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Erase Customer Data</span>
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-900 font-extrabold">GST Ledger Protection Guarantee:</strong> Erasing a customer purges all PII (name, phone, loyalty points) while anonymizing historical invoices into <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono">Anonymous Customer</code>. Store financial ledgers and GST returns remain 100% balanced without retaining personal data.
          </div>
        </div>
      )}

      {/* Tab 4: DPDP Section 13 DPO & Grievance Redressal */}
      {activeTab === "dpo" && (
        <div className="space-y-4 max-w-xl">
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1E3A5F]" />
                <span>Section 13 — Data Protection Officer & Statutory SLA</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Designated contact details and statutory grievance redressal channel required under India DPDP Act 2023.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Designated DPO</span>
                <p className="font-extrabold text-slate-900">Harit Mishra (DPO, DukaanPOS)</p>
                <p className="text-[11px] text-slate-500 font-mono">dpo@dukaanpos.in</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Statutory SLA</span>
                <p className="font-extrabold text-[#1FAA59]">7 Business Days Turnaround</p>
                <p className="text-[11px] text-slate-500 font-mono">Sec 13(1) Statutory Response</p>
              </div>
            </div>

            {grievanceSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-[#1FAA59] p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{grievanceSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFileGrievance} className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submit Customer DPDP Grievance Ticket
              </h4>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Grievance / Request Category</label>
                <select
                  value={grievanceType}
                  onChange={(e) => setGrievanceType(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F]"
                >
                  <option value="erasure">Section 12: Request PII Data Erasure</option>
                  <option value="access">Section 11: Request PII Summary Report</option>
                  <option value="correction">Section 11: Request PII Correction / Update</option>
                  <option value="consent_withdraw">Section 6: Withdraw Billing PII Consent</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Details & Customer Identification</label>
                <textarea
                  rows="3"
                  required
                  value={grievanceText}
                  onChange={(e) => setGrievanceText(e.target.value)}
                  placeholder="Provide customer phone number, name, and specific request details…"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A5F]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-extrabold text-xs rounded-lg shadow transition min-h-[44px]"
              >
                Log Statutory Grievance Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Encrypted Vault Backup, Recovery & Offline Outbox Queue */}
      {activeTab === "backup" && (
        <div className="space-y-4 max-w-2xl animate-fade-in">
          {/* Section 1: Backup & Export */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
                <Download className="w-5 h-5 text-[#1E3A5F]" />
                <span>Encrypted Vault Backup Export</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Download a cryptographically sealed offline backup (.dukaan file) encrypted with AES-GCM 256-bit using your cashier PIN.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-mono text-[11px] text-slate-600">
                <span>Products in Catalog:</span>
                <strong className="text-slate-900">{products.length}</strong>
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-600">
                <span>Khata Customers & Ledgers:</span>
                <strong className="text-slate-900">{customers.length}</strong>
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-600">
                <span>Sales Invoices Recorded:</span>
                <strong className="text-slate-900">{sales.length}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportBackup}
              className="px-5 py-3 bg-[#1E3A5F] hover:bg-[#152a45] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow transition min-h-[44px]"
            >
              <Download className="w-4 h-4 text-[#F5A623]" />
              <span>Download Encrypted Vault (.dukaan)</span>
            </button>
          </div>

          {/* Section 2: Vault Restore */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#2F5E3D]" />
                <span>Restore Encrypted Backup</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Restore store database from a previously exported .dukaan file. The file is validated and decrypted using your PIN.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Cashier PIN for Decryption (Leave blank to use current PIN)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={restorePin}
                  onChange={(e) => setRestorePin(e.target.value)}
                  placeholder="Enter PIN used when backup was created…"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Select .dukaan Vault File
                </label>
                <input
                  type="file"
                  accept=".dukaan,.json,.txt"
                  onChange={handleImportBackup}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cloud Synchronization Queue */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#C2782A]" />
                  <span>Cloud Synchronization Queue</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Transactions synchronized live to your central cloud store backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => syncToCloud()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Trigger Cloud Sync</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Total Outbox Events:</span>
                <span className="font-mono font-bold text-slate-900">{syncOutbox.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Pending Cloud Delivery:</span>
                <span className="font-mono font-bold text-amber-700">
                  {syncOutbox.filter((e) => e.status === "pending_sync").length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Acknowledged Synced:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {syncOutbox.filter((e) => e.status === "synced").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
