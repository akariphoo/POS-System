import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Eye, EyeOff, X, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  // UI States
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete States
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    login_id: "",
    role_id: "",
    branch_id: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      const res = await api.get("/users/init-data");

      setUsers(res.data.data.users || []);
      setRoles(res.data.data.roles || []);
      setBranches(res.data.data.branches || []);

    } catch (err) {
      toast.error("Failed to sync data with server");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const generateLoginId = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  };

  const handleCreate = () => {
    setCreatingUser(true);
    setEditingUser(null);
    setFormData({ name: "", login_id: "", role_id: "", branch_id: "", phone: "", password: "", password_confirmation: "" });
    setErrors({});
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setCreatingUser(false);
    setFormData({
      name: user.name,
      login_id: user.login_id,
      role_id: user.role_id,
      branch_id: user.branch_id,
      phone: user.phone || "",
      password: "",
      password_confirmation: "",
    });
    setErrors({});
  };

  const handleSave = async () => {
    setErrors({});
    const isUpdate = !!editingUser;
    const url = isUpdate ? "/users/update" : "/users/create";
    const payload = isUpdate ? { id: editingUser.id, ...formData } : formData;

    try {
      const res = await api.post(url, payload);
      if (res.data.status || res.data.success) {
        toast.success(isUpdate ? "User updated" : "User created");
        setEditingUser(null);
        setCreatingUser(false);
        fetchData();
      }
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const confirmDelete = (id) => {
    setDeletingUserId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      const res = await api.post("/users/delete", { id: deletingUserId });
      if (res.data.status || res.data.success) {
        toast.success("User removed successfully");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const renderError = (field) => errors[field] ? (
    <p className="text-red-500 text-[11px] mt-1 font-medium">{errors[field][0]}</p>
  ) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-0 bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">System Users</h2>
          <p className="text-sm text-gray-400">Manage access levels and branch assignments</p>
        </div>
        <button onClick={handleCreate} className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold shadow-md active:scale-95 transition-all">
          <Plus size={20} /> Add New User
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">Full Name</th>
              <th className="p-4">Login ID</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="font-semibold text-gray-700">{user.name}</div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1"><Phone size={10} /> {user.phone || 'No phone'}</div>
                </td>
                <td className="p-4 text-gray-600 text-sm font-medium">{user.login_id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-gray-600 text-sm italic">
                    <MapPin size={14} className="text-sky-500" />
                    {user.branch_name || "Unassigned"}
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold uppercase tracking-tight">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(user)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><Edit size={18} /></button>
                    <button onClick={() => confirmDelete(user.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(editingUser || creatingUser) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#0a2540]">{editingUser ? "Update Profile" : "Create Account"}</h3>
              <button onClick={() => { setEditingUser(null); setCreatingUser(false); }} className="bg-gray-100 text-gray-500 rounded-full p-1 hover:bg-red-50 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, login_id: generateLoginId(e.target.value) })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-sky-500 transition-all" />
                  {renderError("name")}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Login ID <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.login_id} onChange={(e) => setFormData({
                    ...formData,
                    login_id: generateLoginId(e.target.value)
                  })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-sky-500" />
                  {renderError("login_id")}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Designated Role <span className="text-red-500">*</span></label>
                  <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none bg-white">
                    <option value="">Choose Role</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  {renderError("role_id")}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Assigned Branch <span className="text-red-500">*</span></label>
                  <select value={formData.branch_id} onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none bg-white">
                    <option value="">Choose Branch</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                  </select>
                  {renderError("branch_id")}
                </div>
              </div>

              {/* Phone Row */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none focus:border-sky-500" placeholder="09..." />
                {renderError("phone")}
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password {creatingUser && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg outline-none pr-10 focus:ring-2 focus:ring-sky-500/10" placeholder={editingUser ? "••••••••" : "Set password"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-sky-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {formData.password.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-1 gap-1">
                      {[
                        { label: "8+ characters", met: formData.password.length >= 8 },
                        { label: "One Uppercase", met: /[A-Z]/.test(formData.password) },
                        { label: "One Number", met: /[0-9]/.test(formData.password) },
                        { label: "One Symbol (@#$)", met: /[!@#$%^&*]/.test(formData.password) },
                      ].map((rule, idx) => (
                        <div key={idx} className={`flex items-center gap-2 text-[10px] font-bold ${rule.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${rule.met ? 'bg-emerald-500' : 'bg-gray-300'}`} /> {rule.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {renderError("password")}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} className={`w-full border p-2.5 rounded-lg outline-none pr-10 ${formData.password_confirmation && formData.password === formData.password_confirmation ? 'border-emerald-200' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {formData.password_confirmation && (
                    <p className={`mt-2 text-[10px] font-bold ${formData.password === formData.password_confirmation ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {formData.password === formData.password_confirmation ? "✓ Identical" : "✗ No match"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 flex justify-end gap-3 border-t border-gray-50 bg-[#fcfcfc]">
              <button className="px-8 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setEditingUser(null); setCreatingUser(false); }}>Cancel</button>
              <button onClick={handleSave} className="px-8 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 shadow-md active:scale-95 transition-all">
                {editingUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
              <p className="text-gray-500 text-sm mb-6">This will permanently remove the user's access to all branches.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors hover:bg-gray-200">Cancel</button>
                <button onClick={executeDelete} className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-100 active:scale-95 transition-all">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}