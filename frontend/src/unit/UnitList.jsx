import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function UnitList() {
  const [units, setUnits] = useState([]);
  const [editingUnit, setEditingUnit] = useState(null);
  const [creatingUnit, setCreatingUnit] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "solid",
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  const fetchUnits = async () => {
    try {
      const res = await api.get("/unit");
      if (res.data.status) setUnits(res.data.data);
    } catch {
      toast.error("Failed to load units");
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingUnit;
    const url = isUpdate ? `/unit/${editingUnit.id}` : "/unit";
    const method = isUpdate ? "put" : "post";

    try {
      const res = await api[method](url, formData);
      if (res.data.status) {
        toast.success(res.data.message);
        setEditingUnit(null);
        setCreatingUnit(false);
        fetchUnits();
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error("Operation failed");
    }
  };

  const executeDelete = async () => {
    try {
      const res = await api.delete(`/unit/${deletingId}`);
      if (res.data.status) {
        toast.success(res.data.message);
        fetchUnits();
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
          <h2 className="text-xl font-bold text-gray-800">Units</h2>
          <p className="text-sm text-gray-400">Manage your product units</p>
        </div>
        {hasPermission("unit.create") && (
          <button
            className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
            onClick={() => {
              setCreatingUnit(true);
              setEditingUnit(null);
              setFormData({ code: "", name: "", type: "solid", is_active: true });
              setErrors({});
            }}
          >
            <Plus size={20} /> Add Unit
          </button>
        )}
      </div>

      {/* Unit Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Code</th>
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6 font-bold text-gray-700">{unit.code}</td>
                <td className="p-4 text-gray-700">{unit.name}</td>
                <td className="p-4 text-gray-500">{unit.type}</td>
                <td className="p-4 text-gray-500">{unit.is_active ? "Yes" : "No"}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    {hasPermission("unit.edit") && (
                      <button
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                        onClick={() => {
                          setEditingUnit(unit);
                          setFormData({
                            code: unit.code,
                            name: unit.name,
                            type: unit.type,
                            is_active: unit.is_active,
                          });
                        }}
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {hasPermission("unit.delete") && (
                      <button
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        onClick={() => {
                          setDeletingId(unit.id);
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
      {(editingUnit || creatingUnit) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-[#0a2540]">
                {editingUnit ? "Edit Unit" : "Add Unit"}
              </h3>
              <button
                onClick={() => {
                  setEditingUnit(null);
                  setCreatingUnit(false);
                }}
              >
                <div className="bg-red-600 text-white rounded-full p-1">
                  <X size={14} />
                </div>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Code</label>
                <input
                  type="text"
                  maxLength={20}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  placeholder="UNIT01"
                />
                {errors.code && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.code[0]}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  placeholder="Unit Name"
                />
                {errors.name && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.name[0]}</p>}
              </div>

              {/* Type */}
              {/* <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                >
                  <option value="solid">Solid</option>
                  <option value="liquid">Liquid</option>
                  <option value="gas">Gas</option>
                  <option value="special">Special</option>
                </select>
                {errors.type && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.type[0]}</p>}
              </div> */}

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label className="text-gray-700 font-medium">Active</label>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold"
                  onClick={() => {
                    setEditingUnit(null);
                    setCreatingUnit(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600"
                  onClick={handleSave}
                >
                  {editingUnit ? "Update" : "Create"}
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
            <h3 className="text-xl font-bold mb-2">Delete Unit?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
