import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Edit,
  Plus,
  Save,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function RoleAndPermission() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Form State
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/roles/init-data");

      if (res.data?.status) {
        // Destructure the combined data
        const { roles, permissions } = res.data.data;
        setRoles(roles || []);
        setPermissions(permissions || {});
      }
    } catch (error) {
      toast.error("Failed to load management data");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setSelectedPerms(role.permission_ids || []);
    setIsModalOpen(true);
  };

  const confirmDelete = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      const res = await api.post(`/roles/delete/${roleToDelete.id}`);

      if (res.data.status === true) {
        toast.success("Role deleted successfully");
        fetchData(); // Refresh the list
      } else {
        toast.error(res.data.message || "Failed to delete role");
      }
    } catch (error) {
      // If there is a foreign key constraint (users using this role), it will catch here
      toast.error(error.response?.data?.message || "Cannot delete role while it is assigned to users");
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const togglePermission = (id) => {
    setSelectedPerms(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!roleName.trim()) return toast.error("Please enter a role name");

    const payload = selectedRole
      ? { id: selectedRole.id, name: roleName, permissions: selectedPerms }
      : { name: roleName, permissions: selectedPerms };

    try {
      const url = selectedRole ? "/roles/update" : "/roles/store";
      const res = await api.post(url, payload);

      if (res.data.status) {
        toast.success(selectedRole ? "Role updated" : "Role created");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Role Management</h2>
          <p className="text-slate-500 text-sm">Define what your staff can and cannot do.</p>
        </div>
        <button
          onClick={() => {
            setSelectedRole(null);
            setRoleName("");
            setSelectedPerms([]);
            setIsModalOpen(true);
          }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl flex gap-2 items-center transition-all shadow-lg shadow-sky-100"
        >
          <Plus size={20} /> Create New Role
        </button>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-sky-50 p-3 rounded-xl">
                <ShieldCheck className="text-sky-500" size={24} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(role)} className="p-2 hover:bg-sky-50 text-slate-400 hover:text-sky-500 rounded-lg">
                  <Edit size={18} />
                </button>
                <button onClick={() => confirmDelete(role)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{role.name}</h3>
            <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>{role.permission_ids?.length || 0} Permissions enabled</span>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{selectedRole ? "Edit Role" : "New Access Role"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Role Name</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-lg font-medium"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Sales Manager"
                />
              </div>

              <div className="space-y-8">
                {Object.entries(permissions).map(([module, perms]) => (
                  <div key={module}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 bg-sky-500 rounded-full"></div>
                      <h4 className="font-bold text-slate-800 tracking-tight capitalize">{module}</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {perms.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all
                            ${selectedPerms.includes(p.id) ? "bg-sky-50 border-sky-200" : "bg-white border-slate-100 hover:border-slate-300"}`}
                        >
                          <span className={`text-sm font-medium ${selectedPerms.includes(p.id) ? "text-sky-700" : "text-slate-600"}`}>{p.name}</span>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedPerms.includes(p.id) ? "bg-sky-500 border-sky-500" : "border-slate-300 bg-white"}`}>
                            {selectedPerms.includes(p.id) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-500">Cancel</button>
              <button onClick={handleSave} className="bg-sky-500 text-white px-8 py-2.5 rounded-xl font-bold flex gap-2 items-center shadow-lg transition-all">
                <Save size={20} /> {selectedRole ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Role?</h3>
            <p className="text-slate-500 mb-8">Are you sure you want to delete <span className="font-bold text-slate-700">"{roleToDelete?.name}"</span>? This may affect users assigned to this role.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
              <button onClick={executeDelete} className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-100">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}