import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X, Landmark } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function CurrencyList() {
  const [currencies, setCurrencies] = useState([]);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [creatingCurrency, setCreatingCurrency] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});

  const fetchCurrencies = async () => {
    try {
      const res = await api.post("/currency/list");
      if (res.data.status) setCurrencies(res.data.data);
    } catch {
      toast.error("Failed to load currencies");
    }
  };

  useEffect(() => { fetchCurrencies(); }, []);

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingCurrency;
    const url = isUpdate ? "/currency/update" : "/currency/create";
    const payload = isUpdate ? { id: editingCurrency.id, ...formData } : formData;

    try {
      const res = await api.post(url, payload);
      if (res.data.status) {
        toast.success(res.data.message);
        setEditingCurrency(null);
        setCreatingCurrency(false);
        fetchCurrencies();
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error("Operation failed");
    }
  };

  const executeDelete = async () => {
    try {
      const res = await api.post("/currency/delete", { id: deletingId });
      if (res.data.status) {
        toast.success("Currency removed");
        fetchCurrencies();
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  console.log(currencies);
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-0 bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Currencies</h2>
          <p className="text-sm text-gray-400">Manage ISO currency codes for your POS</p>
        </div>
        <button
          className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
          onClick={() => { setCreatingCurrency(true); setEditingCurrency(null); setFormData({ name: "" }); setErrors({}); }}
        >
          <Plus size={20} /> Add Currency
        </button>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Currency Code</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currencies.map((currency) => (
              <tr key={currency.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6 text-gray-700 font-bold">{currency.name}</td>
                <td className="p-4 text-gray-500 text-sm">{currency.created_at}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" onClick={() => { setEditingCurrency(currency); setFormData({ name: currency.name }); }}>
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" onClick={() => { setDeletingId(currency.id); setIsDeleteModalOpen(true); }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Add/Edit */}
      {(editingCurrency || creatingCurrency) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-[#0a2540]">{editingCurrency ? "Edit Currency" : "Add Currency"}</h3>
              <button onClick={() => { setEditingCurrency(null); setCreatingCurrency(false); }}>
                <div className="bg-red-600 text-white rounded-full p-1"><X size={14} /></div>
              </button>
            </div>
            <div className="p-6">
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Currency Symbol (e.g., USD)</label>
              <input
                type="text"
                maxLength={3}
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value.toUpperCase() })}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                placeholder="USD"
              />
              {errors.name && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.name[0]}</p>}
              
              <div className="mt-8 flex gap-3">
                <button className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold" onClick={() => { setEditingCurrency(null); setCreatingCurrency(false); }}>Cancel</button>
                <button className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600" onClick={handleSave}>
                    {editingCurrency ? "Update" : "Create"}
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
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Landmark size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Currency?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone if this currency is linked to capitals.</p>
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