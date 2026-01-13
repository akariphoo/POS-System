import { useState, useEffect } from "react";
import { Search, Bell, HelpCircle, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../config/api";

export default function POSTopbar({ user }) {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);

  // Get user initials
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        document.getElementById("pos-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  return (
    <header className="h-16 bg-white border-b-2 border-gray-200 flex items-center justify-between px-8 shadow-md sticky top-0 z-50">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-gray-900">Accounting</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-bold">Point of Sale</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl mx-8">
        <div
          className={`flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
            searchFocused
              ? "border-blue-500 shadow-lg shadow-blue-100"
              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          <Search
            size={18}
            className={`transition-colors ${searchFocused ? "text-blue-600" : "text-gray-400"}`}
          />
          <input
            id="pos-search"
            type="text"
            placeholder="Search or type a command (Ctrl + G)"
            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400 font-medium"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:shadow-sm relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Help */}
        <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:shadow-sm">
          <HelpCircle size={20} className="text-gray-600" />
        </button>

        {/* User Menu */}
        <div className="relative group">
          <button className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all hover:shadow-sm">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {getUserInitials()}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {user?.name || "User"}
            </span>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors rounded-lg mx-1">
                <User size={16} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
