import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Tags, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function ExpenseCategoryList() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // --- Fetch Data (GET) ---
  const fetchCategories = async () => {
    try {
      const res = await api.get("/expense-categories");
      setCategories(res.data.data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Logic ---
  const handleEdit = (category) => {
    setEditingCategory(category);
    setCreatingCategory(false);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setErrors({});
  };

  const handleCreate = () => {
    setCreatingCategory(true);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setErrors({});
  };

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingCategory;
    
    try {
      let res;
      if (isUpdate) {
        // PUT /api/expense-categories/{id}
        res = await api.put(`/expense-categories/${editingCategory.id}`, formData);
      } else {
        // POST /api/expense-categories
        res = await api.post("/expense-categories", formData);
      }

      if (res.data.status) {
        toast.success(res.data.message || (isUpdate ? "Updated successfully" : "Created successfully"));
        setEditingCategory(null);
        setCreatingCategory(false);
        fetchCategories();
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const executeDelete = async () => {
    try {
      // DELETE /api/expense-categories/{id}
      const res = await api.delete(`/expense-categories/${deletingId}`);
      if (res.data.status) {
        toast.success(res.data.message || "Category deleted");
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-0 bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Expense Categories</h2>
          <p className="text-sm text-gray-400">Organize and track your business spending types</p>
        </div>
        <button
          className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
          onClick={handleCreate}
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Category Name</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-sky-50/30 transition-colors">
                <td className="p-4 pl-6">
                  <span className="text-gray-700 font-semibold">{cat.name}</span>
                </td>
                <td className="p-4 text-gray-500 text-sm italic">
                  {cat.description || "—"}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-sky-500 hover:bg-sky-100 rounded-lg transition-colors" onClick={() => handleEdit(cat)}>
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" onClick={() => { setDeletingId(cat.id); setIsDeleteModalOpen(true); }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
                <tr>
                    <td colSpan="3" className="p-10 text-center text-gray-400 italic">No categories found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(editingCategory || creatingCategory) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={() => { setEditingCategory(null); setCreatingCategory(false); }}>
                <div className="bg-gray-100 text-gray-500 rounded-full p-1 hover:bg-rose-500 hover:text-white transition-colors"><X size={16} /></div>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  placeholder="e.g. Utilities, Salary, Rent"
                />
                {errors.name && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg outline-none min-h-[100px] focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Additional details about this category..."
                />
              </div>
            </div>

            <div className="p-5 flex justify-end gap-3 border-t border-gray-50 bg-[#fcfcfc]">
              <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold" onClick={() => { setEditingCategory(null); setCreatingCategory(false); }}>Cancel</button>
              <button className="px-6 py-2.5 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 shadow-md" onClick={handleSave}>
                {editingCategory ? "Update Category" : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Category?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure? This action cannot be undone and may fail if expenses are linked to this category.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold">Cancel</button>
                <button onClick={executeDelete} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}