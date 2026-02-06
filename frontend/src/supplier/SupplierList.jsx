import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      if (res.data.status) setSuppliers(res.data.data);
    } catch {
      toast.error("Failed to load suppliers");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingSupplier;
    const url = isUpdate ? `/suppliers/${editingSupplier.id}` : "/suppliers";
    const method = isUpdate ? "put" : "post";

    try {
      const res = await api[method](url, formData);
      if (res.data.status) {
        toast.success(res.data.message);
        setEditingSupplier(null);
        setCreatingSupplier(false);
        fetchSuppliers();
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error("Operation failed");
    }
  };

  const executeDelete = async () => {
    try {
      const res = await api.delete(`/suppliers/${deletingId}`);
      if (res.data.status) {
        toast.success(res.data.message);
        fetchSuppliers();
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-0 bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Suppliers</h2>
          <p className="text-sm text-gray-400">Manage your suppliers</p>
        </div>
        {hasPermission("supplier.create") && (
          <button
            className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
            onClick={() => {
              setCreatingSupplier(true);
              setEditingSupplier(null);
              setFormData({ supplier_name: "", contact_name: "", phone: "", email: "" });
              setErrors({});
            }}
          >
            <Plus size={20} /> Add Supplier
          </button>
        )}
      </div>

      {/* Supplier Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Supplier Name</th>
              <th className="p-4">Contact Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6 font-bold text-gray-700">{s.supplier_name}</td>
                <td className="p-4 text-gray-700">{s.contact_name || "-"}</td>
                <td className="p-4 text-gray-700">{s.phone || "-"}</td>
                <td className="p-4 text-gray-700">{s.email || "-"}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    {hasPermission("supplier.edit") && (
                      <button
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                        onClick={() => {
                          setEditingSupplier(s);
                          setFormData({
                            supplier_name: s.supplier_name,
                            contact_name: s.contact_name || "",
                            phone: s.phone || "",
                            email: s.email || "",
                          });
                          setErrors({});
                        }}
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPermission("supplier.delete") && (
                      <button
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        onClick={() => {
                          setDeletingId(s.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
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
      {(editingSupplier || creatingSupplier) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-[#0a2540]">
                {editingSupplier ? "Edit Supplier" : "Add Supplier"}
              </h3>
              <button onClick={() => { setEditingSupplier(null); setCreatingSupplier(false); setErrors({}); }}>
                <div className="bg-red-600 text-white rounded-full p-1"><X size={14} /></div>
              </button>
            </div>
            <div className="p-6 space-y-4">

              {/* Supplier Name */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Supplier Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.supplier_name && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.supplier_name[0]}</p>}
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Contact Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.contact_name && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.contact_name[0]}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone</label>
                <input
                  type="text"
                  maxLength={20}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.phone && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.phone[0]}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  maxLength={100}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.email && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.email[0]}</p>}
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-3">
                <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold" onClick={() => { setEditingSupplier(null); setCreatingSupplier(false); setErrors({}); }}>Cancel</button>
                <button className="flex-1 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600" onClick={handleSave}>
                  {editingSupplier ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60]">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm">
            <h3 className="text-xl font-bold mb-2">Delete Supplier?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
