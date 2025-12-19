import { useState } from "react";
import api from "../config/api";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", { loginId, password });
      const [success, message, data] = res.data;

      if (success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(message || "Login successful!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error(message || "Login failed!");
      }
    } catch {
      toast.error("Network or server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-500 from-indigo-1000">
      <Toaster position="top-right" />

      {/* Left Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-indigo-100">
        <img src="/images/ecommerce-login.svg" alt="Login" className="w-3/4" />
      </div>

      {/* Right Login */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <form
          onSubmit={submit}
          className="bg-white w-full max-w-md p-10 rounded-2xl shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Welcome Back 👋
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Login to POS System
          </p>

          {/* Login Id */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Login ID</label>
            <input
              type="text"
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="test01"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>

          {/* Password with Show / Hide */}
          <div className="mb-6">
            <label className="text-sm text-gray-600">Password</label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
