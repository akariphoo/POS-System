import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    login_id: "",
    role_id: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Logic Functions (Retained from your original code) ---
  const fetchUsers = async () => {
    try {
      const res = await api.post("/users/list");
      setUsers(res.data.data);
    } catch { toast.error("Failed to load users"); }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.post("/roles/list");
      setRoles(res.data.data);
    } catch { toast.error("Failed to load roles"); }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.post("/users/delete", { id });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch { toast.error("Failed to delete user"); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      login_id: user.login_id,
      role_id: user.role_id || user.role,
      phone: user.phone || "",
      password: "",
      password_confirmation: "",
    });
    setErrors({});
  };

  const handleUpdate = async () => {
    setErrors({});
    try {
      await api.post("/users/update", { id: editingUser.id, ...formData });
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleCreate = () => {
    setCreatingUser(true);
    setFormData({ name: "", login_id: "", role_id: "", phone: "", password: "", password_confirmation: "" });
    setErrors({});
  };

  const handleStore = async () => {
    setErrors({});
    try {
      await api.post("/users/create", formData);
      toast.success("User created successfully");
      setCreatingUser(false);
      fetchUsers();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const renderError = (field) => errors[field] ? (
    <p className="text-red-500 text-[11px] mt-1 font-medium">{errors[field][0]}</p>
  ) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Table Header */}
      <div className="flex justify-between items-center mb-0 bg-white p-5 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Users</h2>
          <p className="text-sm text-gray-400">Manage your system users</p>
        </div>
        <button
          className="bg-sky-500 text-white px-5 py-2.5 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-bold transition-all shadow-md active:scale-95"
          onClick={handleCreate}
        >
          <Plus size={20} /> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfc] border-b border-gray-100">
            <tr className="text-gray-500 text-[13px] font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">User Name</th>
              <th className="p-4">Login ID</th>
              <th className="p-4">Role</th>
              <th className="p-4">Phone No.</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6 text-gray-700 font-semibold">{user.name}</td>
                <td className="p-4 text-gray-600">{user.login_id}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold uppercase">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{user.phone}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" onClick={() => handleEdit(user)}>
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => handleDelete(user.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Modal (Sky Blue Theme) */}
      {(editingUser || creatingUser) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#0a2540]">
                {editingUser ? "Edit User" : "Add User"}
              </h3>
              <button 
                onClick={() => { setEditingUser(null); setCreatingUser(false); }}
                className="hover:scale-110 transition-transform"
              >
                <div className="bg-red-600 text-white rounded-full p-1 shadow-sm"><X size={14} /></div>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Field: Name */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">User <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  placeholder="Enter user name"
                />
                {renderError("name")}
              </div>

              {/* Field: Login ID */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Login ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.login_id}
                  onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  placeholder="Enter login ID"
                />
                {renderError("login_id")}
              </div>

              {/* Field: Role */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                >
                  <option value="">Select</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
                {renderError("role_id")}
              </div>

              {/* Field: Phone */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone No.</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  placeholder="Enter phone number"
                />
                {renderError("phone")}
              </div>

              {/* Password Row (Side by Side) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all pr-10"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-sky-500">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {renderError("password")}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all pr-10"
                    />
                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-sky-500">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {renderError("password_confirmation")}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 flex justify-end gap-3 border-t border-gray-50 bg-[#fcfcfc]">
              <button
                className="px-8 py-2.5 bg-[#0a2540] text-white rounded-lg font-bold hover:bg-[#153a5f] transition-all shadow-sm"
                onClick={() => { setEditingUser(null); setCreatingUser(false); }}
              >
                Cancel
              </button>
              <button
                className="px-8 py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-all shadow-sm"
                onClick={editingUser ? handleUpdate : handleStore}
              >
                {editingUser ? "Save User" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}