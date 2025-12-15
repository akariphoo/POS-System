import { useState } from "react";
import api from "../config/api";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });

      // Your backend returns: [success, message, data, status]
      const [success, message, data] = res.data;

      if (success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(message || "Login successful!");

        // Redirect after 1 second
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error(message || "Login failed!");
      }
    } catch (err) {
      toast.error("Network or server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <Toaster position="top-right" reverseOrder={false} />
      <form
        onSubmit={submit}
        className="bg-white w-96 p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">POS System</h1>
          <p className="text-sm text-gray-500">Admin / Cashier Login</p>
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Button */}
        <button
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} POS System
        </p>
      </form>
    </div>
  );
}
