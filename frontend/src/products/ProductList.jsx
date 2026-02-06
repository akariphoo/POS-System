import { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, Plus, X, ImageIcon, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Pagination State
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    image: null
  });

  const [errors, setErrors] = useState({});

  // Fetch Products with Pagination and Search
  const fetchProducts = async (page = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&search=${searchTerm}`);
      if (res.data.status) {
        // Laravel paginate() returns data inside data.data
        const { data, current_page, last_page, total, per_page } = res.data.data;
        setProducts(data);
        setPagination({ current_page, last_page, total, per_page });
      }
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search logic for performance
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const closeModal = () => {
    setEditingProduct(null);
    setCreatingProduct(false);
    setFormData({ name: "", sku: "", barcode: "", description: "", image: null });
    setPreviewUrl(null);
    setErrors({});
  };

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingProduct;
    const data = new FormData();
    data.append("name", formData.name);
    data.append("sku", formData.sku || "");
    data.append("barcode", formData.barcode || "");
    data.append("description", formData.description || "");
    
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    const url = isUpdate ? `/products/${editingProduct.id}` : "/products";
    
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isUpdate) data.append("_method", "PUT");

      const res = await api.post(url, data, config);

      if (res.data.status) {
        toast.success(res.data.message);
        closeModal();
        fetchProducts(pagination.current_page);
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error("Operation failed");
    }
  };

  const executeDelete = async () => {
    try {
      const res = await api.delete(`/products/${deletingId}`);
      if (res.data.status) {
        toast.success(res.data.message);
        // Refresh current page, or previous if current is now empty
        const pageToFetch = products.length === 1 && pagination.current_page > 1 
          ? pagination.current_page - 1 
          : pagination.current_page;
        fetchProducts(pageToFetch);
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Products</h2>
            <p className="text-sm text-gray-400">Manage your inventory efficiently</p>
          </div>
          {hasPermission("product.create") && (
            <button
              className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
              onClick={() => { setCreatingProduct(true); setEditingProduct(null); }}
            >
              <Plus size={20} /> Add Product
            </button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name, SKU or barcode..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfcfc] border-b border-gray-100">
              <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Image</th>
                <th className="p-4">Product Info</th>
                <th className="p-4">Identifiers</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="animate-spin text-sky-500" size={32} />
                      <p className="text-sm font-medium">Fetching products...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      {p.image ? (
                        <img 
                          src={`${import.meta.env.VITE_STORAGE_URL}/${p.image}`} 
                          alt={p.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-700">{p.name}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-gray-400 uppercase">SKU: {p.sku || "N/A"}</span>
                        <span className="font-medium text-xs text-gray-400 uppercase">BC: {p.barcode || "N/A"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate">{p.description || "-"}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {hasPermission("product.edit") && (
                          <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            onClick={() => {
                              setEditingProduct(p);
                              setFormData({ name: p.name, sku: p.sku || "", barcode: p.barcode || "", description: p.description || "", image: p.image });
                              if (p.image) setPreviewUrl(`${import.meta.env.VITE_STORAGE_URL}/${p.image}`);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {hasPermission("product.delete") && (
                          <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            onClick={() => { setDeletingId(p.id); setIsDeleteModalOpen(true); }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-[#fcfcfc] gap-4">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-800">{products.length}</span> of <span className="text-gray-800">{pagination.total}</span> products
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page === 1 || loading}
              onClick={() => fetchProducts(pagination.current_page - 1)}
              className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {[...Array(pagination.last_page)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchProducts(i + 1)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    pagination.current_page === i + 1 
                      ? "bg-sky-500 text-white shadow-md shadow-sky-200" 
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={pagination.current_page === pagination.last_page || loading}
              onClick={() => fetchProducts(pagination.current_page + 1)}
              className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal (remains same with scroll fix) */}
      {(editingProduct || creatingProduct) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-[#0a2540]">{editingProduct ? "Edit Product" : "New Product"}</h3>
              <button onClick={closeModal} className="bg-gray-100 text-gray-500 rounded-full p-1 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-white shrink-0">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={24} />}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 cursor-pointer" />
                </div>
              </div>
              {["name", "sku", "barcode", "description"].map((field) => (
                <div key={field}>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5 capitalize">{field}</label>
                  {field === "description" ? (
                    <textarea value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20" rows="3" />
                  ) : (
                    <input type="text" value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-sky-500/20" />
                  )}
                  {errors[field] && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors[field][0]}</p>}
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors" onClick={closeModal}>Cancel</button>
                <button className="flex-1 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 shadow-lg shadow-sky-100 active:scale-[0.98] transition-all" onClick={handleSave}>{editingProduct ? "Update" : "Save Product"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Omitted for brevity, remains same as previous) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60] backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-700">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}