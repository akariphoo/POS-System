import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, User, X, Phone, MapPin, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Simplified formData for One-to-One
  const [formData, setFormData] = useState({
    name: "",
    type: "retail",
    phone: "",
    nrc: "",
    address: "",
    is_default: false,
  });
  const [errors, setErrors] = useState({});

  // --- Data Fetching ---
  const fetchCustomers = async () => {
    try {
      const res = await api.post("/customers/list");
      setCustomers(res.data.data);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- Delete Logic ---
  const executeDelete = async () => {
    try {
      await api.post("/customers/delete", { id: deletingCustomerId });
      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingCustomerId(null);
    }
  };

  // --- Create/Edit Logic ---
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setCreatingCustomer(false);
    setFormData({
      name: customer.name,
      type: customer.type,
      phone: customer.contact?.phone || "",
      nrc: customer.contact?.nrc || "",
      address: customer.contact?.address || "",
      is_default: !!customer.is_default,
    });
    setErrors({});
  };

  const handleCreate = () => {
    setCreatingCustomer(true);
    setEditingCustomer(null);
    setFormData({ 
        name: "", 
        type: "retail", 
        phone: "", 
        nrc: "", 
        address: "", 
        is_default: false 
    });
    setErrors({});
  };

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingCustomer;
    const url = isUpdate ? "/customers/update" : "/customers/create";
    const payload = isUpdate ? { id: editingCustomer.id, ...formData } : formData;

    try {
      const res = await api.post(url, payload);
      if (res.data.status || res.data.success) {
        toast.success(isUpdate ? "Customer updated" : "Customer created");
        setEditingCustomer(null);
        setCreatingCustomer(false);
        fetchCustomers();
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
          <h2 className="text-xl font-bold text-gray-800">Customers</h2>
          <p className="text-sm text-gray-400">Manage client profiles and contact info</p>
        </div>
        <button className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95" onClick={handleCreate}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Customer Name</th>
              <th className="p-4">Contact (Phone/NRC)</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((cust) => (
              <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6">
                    <span className="text-gray-700 font-semibold">{cust.name}</span>
                </td>
                <td className="p-4">
                    <div className="text-gray-600 text-sm">{cust.contact?.phone || 'N/A'}</div>
                    <div className="text-gray-400 text-[10px]">{cust.contact?.nrc || 'No NRC'}</div>
                </td>
                <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${cust.type === 'wholesale' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {cust.type}
                    </span>
                </td>
                <td className="p-4">
                  {cust.is_default && (
                    <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Default</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => handleEdit(cust)}>
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => { setDeletingCustomerId(cust.id); setIsDeleteModalOpen(true); }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(editingCustomer || creatingCustomer) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#0a2540]">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h3>
              <button onClick={() => { setEditingCustomer(null); setCreatingCustomer(false); }}>
                <div className="bg-red-600 text-white rounded-full p-1 shadow-sm"><X size={14} /></div>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Customer Name *</label>
                    <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                    {renderError("name")}
                </div>
                <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Type</label>
                    <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                    >
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-1"><Phone size={14}/> Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                    placeholder="09..."
                  />
                  {renderError("phone")}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">NRC Number</label>
                  <input
                    type="text"
                    value={formData.nrc}
                    onChange={(e) => setFormData({ ...formData, nrc: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg outline-none"
                    placeholder="NRC"
                  />
                  {renderError("nrc")}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-1"><MapPin size={14}/> Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none min-h-[80px]"
                  placeholder="Street address..."
                />
                {renderError("address")}
              </div>

              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-sky-500"
                    />
                    <div>
                        <span className="block text-sm font-bold text-sky-900">Set as Default Customer</span>
                        <span className="block text-[11px] text-sky-700">Usually used for 'Walk-in' customers.</span>
                    </div>
                </label>
              </div>
            </div>

            <div className="p-5 flex justify-end gap-3 border-t border-gray-50 bg-[#fcfcfc]">
              <button className="px-8 py-2.5 bg-[#0a2540] text-white rounded-lg font-bold" onClick={() => { setEditingCustomer(null); setCreatingCustomer(false); }}>Cancel</button>
              <button className="px-8 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600" onClick={handleSave}>
                {editingCustomer ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Same as Branch) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Customer?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
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