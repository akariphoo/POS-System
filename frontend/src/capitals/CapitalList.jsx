import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function CapitalList() {
  const [capitals, setCapitals] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    currency_id: "",
    initial_capital_amount: "",
    remaining_capital_amount: "",
  });

  const [errors, setErrors] = useState({});

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchCapitals();
    fetchCurrencies();
  }, []);

  const fetchCapitals = async () => {
    const res = await api.post("/capital/list");
    if (res.data.status) setCapitals(res.data.data);
  };

  const fetchCurrencies = async () => {
    const res = await api.post("/currency/list");
    if (res.data.status) setCurrencies(res.data.data);
  };

  /* ================= MODAL HANDLERS ================= */

  const handleOpenModal = (item = null) => {
    setEditingItem(item);

    setFormData(
      item
        ? {
            currency_id: item.currency_id,
            initial_capital_amount: item.initial_amount,
            remaining_capital_amount: item.remaining_amount,
          }
        : {
            currency_id: "",
            initial_capital_amount: "",
            remaining_capital_amount: "",
          }
    );

    setErrors({});
    setIsModalOpen(true);
  };

  /* ================= SAVE (CREATE / UPDATE) ================= */

  const handleSave = async () => {
    const url = editingItem ? "/capital/update" : "/capital/create";
    const payload = editingItem
      ? { id: editingItem.id, ...formData }
      : formData;

    try {
      const res = await api.post(url, payload);

      if (res.data.status) {
        toast.success(res.data.message);
        setIsModalOpen(false);
        fetchCapitals();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    try {
      const res = await api.post("/capital/delete", {
        id: deletingId,
      });

      if (res.data.status) {
        toast.success(res.data.message);
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        fetchCapitals();
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-t-xl border-b shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Capitals</h2>
          <p className="text-sm text-gray-400">
            Manage business funds per currency
          </p>
        </div>
        <button
          className="bg-sky-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} /> Add Capital
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b text-gray-500 text-[13px] font-bold uppercase">
            <tr>
              <th className="p-4 pl-6">Currency</th>
              <th className="p-4">Initial Amount</th>
              <th className="p-4">Remaining</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {capitals.map((cap) => (
              <tr key={cap.id} className="hover:bg-gray-50">
                <td className="p-4 pl-6 font-bold text-sky-700">
                  {cap.currency_name}
                </td>
                <td className="p-4 font-mono">
                  {Number(cap.initial_amount).toLocaleString()}
                </td>
                <td className="p-4 font-mono text-emerald-600 font-bold">
                  {Number(cap.remaining_amount).toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      className="text-emerald-500 p-2"
                      onClick={() => handleOpenModal(cap)}
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      className="text-rose-500 p-2"
                      onClick={() => {
                        setDeletingId(cap.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between p-6 border-b">
              <h3 className="font-bold">
                {editingItem ? "Edit" : "New"} Capital
              </h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Currency</label>
                <select
                  className="w-full border p-2.5 rounded-lg outline-none"
                  value={formData.currency_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency_id: e.target.value,
                    })
                  }
                  disabled={!!editingItem}
                >
                  <option value="">Select Currency</option>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.currency_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.currency_id[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Initial Capital
                </label>
                <input
                  type="number"
                  className="w-full border p-2.5 rounded-lg outline-none"
                  value={formData.initial_capital_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initial_capital_amount: e.target.value,
                    })
                  }
                />
              </div>

              {editingItem && (
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Remaining Capital
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2.5 rounded-lg outline-none"
                    value={formData.remaining_capital_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remaining_capital_amount: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <button
                className="w-full bg-sky-500 text-white py-3 rounded-lg font-bold mt-4"
                onClick={handleSave}
              >
                Save Capital
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <Wallet className="mx-auto text-rose-500 mb-3" size={40} />
              <h3 className="font-bold text-lg">Delete Capital?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg border"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingId(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-bold"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
