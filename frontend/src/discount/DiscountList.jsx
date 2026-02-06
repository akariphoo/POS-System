import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function DiscountList() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });

  const [editingDiscount, setEditingDiscount] = useState(null);
  const [creatingDiscount, setCreatingDiscount] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    discount_type: "fixed",
    value: "",
    buy_quantity: "",
    get_quantity: ""
  });

  const [errors, setErrors] = useState({});

  // Fetch
  const fetchDiscounts = async (page = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/discounts?page=${page}&search=${searchTerm}`);
      if (res.data.status) {
        const { data, current_page, last_page, total, per_page } = res.data.data;
        setDiscounts(data);
        setPagination({ current_page, last_page, total, per_page });
      }
    } catch {
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchDiscounts(1, search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const closeModal = () => {
    setEditingDiscount(null);
    setCreatingDiscount(false);
    setFormData({ name: "", discount_type: "fixed", value: "", buy_quantity: "", get_quantity: "" });
    setErrors({});
  };

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingDiscount;

    const payload = {
      ...formData,
      value: formData.value || null,
      buy_quantity: formData.buy_quantity || null,
      get_quantity: formData.get_quantity || null
    };

    try {
      if (isUpdate) {
        await api.post(`/discounts/${editingDiscount.id}`, { ...payload, _method: "PUT" });
        toast.success("Discount updated");
      } else {
        await api.post(`/discounts`, payload);
        toast.success("Discount created");
      }

      closeModal();
      fetchDiscounts(pagination.current_page);
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    await api.delete(`/discounts/${deletingId}`);
    toast.success("Discount deleted");
    setDeletingId(null);
    fetchDiscounts(pagination.current_page);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-5 rounded-t-xl shadow-sm border-b space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Discounts</h2>
            <p className="text-sm text-gray-400">Manage POS discount rules</p>
          </div>
          {hasPermission("discount.create") && (
            <button
              className="bg-sky-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2"
              onClick={() => setCreatingDiscount(true)}
            >
              <Plus size={18} /> Add Discount
            </button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search discount..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm border mt-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Buy</th>
                <th className="p-4">Get</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : discounts.length ? discounts.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-4 font-semibold">{d.name}</td>
                  <td className="p-4">{d.discount_type}</td>
                  <td className="p-4">{d.value ?? "-"}</td>
                  <td className="p-4">{d.buy_quantity ?? "-"}</td>
                  <td className="p-4">{d.get_quantity ?? "-"}</td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => { setEditingDiscount(d); setFormData(d); }}><Edit size={16} /></button>
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => setDeletingId(d.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400">No discounts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(editingDiscount || creatingDiscount) && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">{editingDiscount ? "Edit Discount" : "New Discount"}</h3>

            <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border p-2 rounded" />
            
            <select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })} className="w-full border p-2 rounded">
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
              <option value="order_fixed">Order Fixed</option>
              <option value="order_percentage">Order Percentage</option>
            </select>

            <input placeholder="Value" type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full border p-2 rounded" />

            {formData.discount_type === "buy_x_get_y" && (
              <>
                <input placeholder="Buy Quantity" type="number" value={formData.buy_quantity} onChange={e => setFormData({ ...formData, buy_quantity: e.target.value })} className="w-full border p-2 rounded" />
                <input placeholder="Get Quantity" type="number" value={formData.get_quantity} onChange={e => setFormData({ ...formData, get_quantity: e.target.value })} className="w-full border p-2 rounded" />
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-gray-100 py-2 rounded" onClick={closeModal}>Cancel</button>
              <button className="flex-1 bg-sky-500 text-white py-2 rounded" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Delete Discount?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
