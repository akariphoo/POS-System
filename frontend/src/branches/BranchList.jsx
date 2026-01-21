import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, MapPin, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    branch_name: "",
    city: "",
    state: "",
    address: "",
    is_default: false,
  });
  const [errors, setErrors] = useState({});

  // --- Data Fetching ---
  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches/list");
      setBranches(res.data.data);
    } catch {
      toast.error("Failed to load branches");
    }
  };

  useEffect(() => {
      console.log("BranchList Mounted"); // If this prints twice, it's Strict Mode or a Parent re-render

    fetchBranches();
  }, []);

  // --- Delete Logic ---
  const confirmDelete = (id) => {
    setDeletingBranchId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/branches/delete/${deletingBranchId}`);
      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch {
      toast.error("Failed to delete branch");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingBranchId(null);
    }
  };

  // --- Create/Edit Logic ---
  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setCreatingBranch(false);
    setFormData({
      branch_name: branch.branch_name,
      city: branch.city,
      state: branch.state,
      address: branch.address || "",
      is_default: !!branch.is_default,
    });
    setErrors({});
  };

  const handleCreate = () => {
    setCreatingBranch(true);
    setEditingBranch(null);
    setFormData({
      branch_name: "",
      city: "",
      state: "",
      address: "",
      is_default: false
    });
    setErrors({});
  };

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingBranch;
    const url = isUpdate ? "/branches/update" : "/branches/create";
    const payload = isUpdate ? { id: editingBranch.id, ...formData } : formData;

    try {
      const res = await api.post(url, payload);
      if (res.data.status || res.data.success) {
        toast.success(isUpdate ? "Branch updated successfully" : "Branch created successfully");
        setEditingBranch(null);
        setCreatingBranch(false);
        fetchBranches();
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const renderError = (field) => errors[field] ? (
    <p className="text-red-500 text-[11px] mt-1 font-medium">{errors[field][0]}</p>
  ) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-0 bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Branches</h2>
          <p className="text-sm text-gray-400">Manage shop locations and defaults</p>
        </div>
        {hasPermission('branches.create') && (
          <button
            className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
            onClick={handleCreate}
          >
            <Plus size={20} /> Add Branch
          </button>
        )}
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Branch Name</th>
              <th className="p-4">Location (City/State)</th>
              <th className="p-4">Address</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {branches.map((branch) => (
              <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-semibold">{branch.branch_name}</span>

                  </div>
                </td>
                <td className="p-4 text-gray-600 text-sm">
                  {branch.city}, {branch.state}
                </td>
                <td className="p-4 text-gray-500 text-xs italic truncate max-w-[200px]">
                  {branch.address || "N/A"}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${branch.is_default ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {branch.is_default ? (
                      <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Default</span>
                    ) : <span className="bg-emerald-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Regular</span>
                    }
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    {hasPermission('branches.edit') && (
                      <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => handleEdit(branch)}>
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPermission('branches.delete') && (
                      <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => confirmDelete(branch.id)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(editingBranch || creatingBranch) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#0a2540]">
                {editingBranch ? "Edit Branch" : "Add Branch"}
              </h3>
              <button onClick={() => { setEditingBranch(null); setCreatingBranch(false); }}>
                <div className="bg-red-600 text-white rounded-full p-1 shadow-sm"><X size={14} /></div>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.branch_name}
                  onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  placeholder="e.g. Main Warehouse"
                />
                {renderError("branch_name")}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                    placeholder="City"
                  />
                  {renderError("city")}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                    placeholder="State"
                  />
                  {renderError("state")}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none min-h-[80px]"
                  placeholder="Street address, building, etc."
                />
                {renderError("address")}
              </div>

              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-sky-900">Set as Default Branch</span>
                    <span className="block text-[11px] text-sky-700">All new sales and stock will be linked here by default.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-5 flex justify-end gap-3 border-t border-gray-50 bg-[#fcfcfc]">
              <button className="px-8 py-2.5 bg-[#0a2540] text-white rounded-lg font-bold" onClick={() => { setEditingBranch(null); setCreatingBranch(false); }}>Cancel</button>
              <button className="px-8 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600" onClick={handleSave}>
                {editingBranch ? "Update Branch" : "Create Branch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Close Branch?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this branch? This might affect stock records linked to this location.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold">Cancel</button>
                <button onClick={executeDelete} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}