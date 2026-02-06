import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Loader2, Calendar, Hash } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function ProductDiscountList() {
  const [products, setProducts] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    product_id: "",
    discount_id: "",
    usage_type: "date",
    start_date: "",
    end_date: "",
    usage_limit: "",
    status: "active"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/product-discounts/form-data");
      setProducts(res.data.products);
      setDiscountRules(res.data.discounts);
      setProductDiscounts(res.data.product_discounts);
    } catch { toast.error("Failed to load data"); } 
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setErrors({});
    setForm({ product_id: "", discount_id: "", usage_type: "date", start_date: "", end_date: "", usage_limit: "", status: "active" });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (pd) => {
    setErrors({});
    setEditing(pd);
    setCreating(false);
    setForm({
      product_id: pd.product_id,
      discount_id: pd.discount_id,
      usage_type: pd.usage_type,
      start_date: pd.start_date || "",
      end_date: pd.end_date || "",
      usage_limit: pd.usage_limit || "",
      status: pd.status
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveDiscount = async () => {
    setErrors({});
    try {
      if (editing) await api.put(`/product-discounts/${editing.id}`, form);
      else await api.post("/product-discounts", form);
      toast.success(editing ? "Updated" : "Assigned");
      fetchAll();
      setCreating(false); setEditing(null);
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error("Save failed");
    }
  };

  const deleteDiscount = async () => {
  try {
    await api.delete(`/product-discounts/${deletingId}`);
    toast.success("Assignment removed successfully");
    setDeletingId(null); // Close modal
    fetchAll(); // Refresh table
  } catch (err) {
    toast.error("Failed to delete. It might be linked to other records.");
  }
};

  const renderValue = (discount) => {
    if (!discount) return "-";
    if (discount.discount_type === "percentage") return `${discount.value}%`;
    if (discount.discount_type === "fixed") return `$${discount.value}`;
    if (discount.discount_type === "buy_x_get_y") return `Buy ${discount.buy_quantity} Get ${discount.get_quantity}`;
    return "-";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-5 rounded-xl shadow-sm border mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Product Discounts</h2>
          <p className="text-sm text-gray-400">Manage rules for specific products</p>
        </div>
        <button onClick={openCreate} className="bg-sky-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-sky-600">
          <Plus size={20} /> Add Assignment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-sky-500" /></td></tr>
            ) : productDiscounts.map(pd => (
              <tr key={pd.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-bold">{pd.product?.name}</td>
                <td className="p-4">
                  <div className="font-semibold">{pd.discount?.name}</div>
                  <div className="text-xs text-gray-400">{renderValue(pd.discount)}</div>
                </td>
                <td className="p-4">
                  {pd.usage_type === 'date' ? (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      <Calendar size={12}/> {pd.start_date} to {pd.end_date}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                      <Hash size={12}/> Limit: {pd.remaining_usage_limit} / {pd.usage_limit}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${pd.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {pd.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                   <button onClick={() => openEdit(pd)} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded"><Edit size={18} /></button>
                   <button onClick={() => setDeletingId(pd.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(editing || creating) && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold">{editing ? "Edit Assignment" : "Assign Discount"}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Product</label>
                <select name="product_id" disabled={!!editing} value={form.product_id} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1">
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.product_id && <p className="text-red-500 text-[10px]">{errors.product_id[0]}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Discount Rule</label>
                <select name="discount_id" value={form.discount_id} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1">
                  <option value="">Select Discount</option>
                  {discountRules.map(d => <option key={d.id} value={d.id}>{d.name} ({renderValue(d)})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Usage Type</label>
                  <select name="usage_type" value={form.usage_type} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1">
                    <option value="date">Date Range</option>
                    <option value="usage_limit">Usage Limit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {form.usage_type === "date" ? (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                  <div>
                    <label className="text-xs font-semibold">Start Date</label>
                    <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1 text-sm" />
                    {errors.start_date && <p className="text-red-500 text-[10px]">{errors.start_date[0]}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold">End Date</label>
                    <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold">Max Usage Count</label>
                  <input type="number" name="usage_limit" value={form.usage_limit} onChange={handleChange} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="e.g. 500" />
                  {errors.usage_limit && <p className="text-red-500 text-[10px]">{errors.usage_limit[0]}</p>}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => {setCreating(false); setEditing(null);}} className="flex-1 bg-gray-100 py-2 rounded-lg font-semibold text-gray-600">Cancel</button>
              <button onClick={saveDiscount} className="flex-1 bg-sky-500 text-white py-2 rounded-lg font-semibold hover:bg-sky-600">
                {editing ? "Update Changes" : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation omitted for brevity, same as your original */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Delete Discount?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
              <button onClick={deleteDiscount} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}