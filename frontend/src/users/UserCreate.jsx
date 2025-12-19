import { useEffect, useState } from "react";
import api from "../config/api";
import { Plus, Pencil, Trash } from "lucide-react";
import toast from "react-hot-toast";

export default function UserLisaat() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.post("/users/list");
      setUsers(res.data.data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      await api.post("/users/delete", { id });
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Users</h1>

        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <table className="w-full border rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Username</th>
            <th className="text-left">Login ID</th>
            <th className="text-left">Role</th>
            <th className="text-center w-[120px]">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}

          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{u.username}</td>
              <td>{u.login_id}</td>
              <td>{u.role?.name}</td>

              <td className="flex justify-center gap-3 p-3">
                <button
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => deleteUser(u.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
