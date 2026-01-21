import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Box,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  UserPlus2Icon
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState("super_admin");
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) setActiveItem("dashboard");
    else if (location.pathname.startsWith("/users")) setActiveItem("users");
    else setActiveItem("");
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");

      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully");

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 shadow-sm z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-50 bg-white">
        <div className="bg-sky-500 p-1.5 rounded-lg mr-2 shadow-md shadow-sky-100">
          <Box size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Pharma<span className="text-sky-500 font-extrabold">POS</span>
        </h1>
      </div>

      <div className="p-4 text-sm overflow-y-auto h-[calc(100vh-4rem)]">
        {/* SECTION: MAIN */}
        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest ml-4 mb-3 mt-2">
          General
        </p>

        <MenuItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          active={activeItem === "dashboard"}
          onClick={() => navigate("/dashboard")}
        />

        {/* SECTION: ADMIN */}
        <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest ml-4 mb-3 mt-6">
          Administrator
        </p>

        {(hasPermission('branches.view') ||
          hasPermission('users.view') ||
          hasPermission('role_permission.view')) && (

            <SubMenu
              icon={<UserCog size={20} />}
              label="User Controls"
              open={openMenu === "super_admin"}
              onClick={() => toggleMenu("super_admin")}
            >

              {hasPermission('branches.view') && (
                <SubItem
                  label="Branches"
                  onClick={() => navigate("/branches")}
                />
              )}

              {hasPermission('users.view') && (
                <SubItem
                  label="Staff List"
                  onClick={() => navigate("/users")}
                />
              )}

              {hasPermission('role_permission.view') && (
                <SubItem
                  label="Role & Permission"
                  onClick={() => navigate("/roleandpermission")}
                />
              )}

            </SubMenu>
          )}

        {
          hasPermission('customers.view') &&
          <SubMenu
            icon={<UserPlus2Icon size={20} />}
            label="People"
            open={openMenu === "people"}
            onClick={() => toggleMenu("people")}
          >
            {hasPermission('customers.view') &&
              <SubItem
                label="Customers"
                active={activeItem === "customers"}
                onClick={() => navigate("/customers")}
              />
            }
          </SubMenu>
        }


        {(hasPermission('currency.view') ||
          hasPermission('capital.view') ||
          hasPermission('expense_category.view') ||
          hasPermission('expense.view') ||
          hasPermission('tax.view') ||
          hasPermission('exchange_rate.view')) && (

            <SubMenu
              icon={<Settings size={20} />}
              label="System Setting"
              open={openMenu === "setting"}
              onClick={() => toggleMenu("setting")}
            >

              {hasPermission('currency.view') && (
                <SubItem
                  label="Currency"
                  active={activeItem === "currency"}
                  onClick={() => navigate("/currency")}
                />
              )}

              {hasPermission('capital.view') && (
                <SubItem
                  label="Capital"
                  active={activeItem === "capital"}
                  onClick={() => navigate("/capital")}
                />
              )}

              {hasPermission('expense_category.view') && (
                <SubItem
                  label="Expense Category"
                  active={activeItem === "expense_category"}
                  onClick={() => navigate("/expense-category")}
                />
              )}

              {hasPermission('expense.view') && (
                <SubItem
                  label="Expense"
                  active={activeItem === "expense"}
                  onClick={() => navigate("/expense")}
                />
              )}

              {hasPermission('tax.view') && (
                <SubItem
                  label="Tax"
                  active={activeItem === "tax"}
                  onClick={() => navigate("/tax")}
                />
              )}

              {hasPermission('exchange_rate.view') && (
                <SubItem
                  label="Exchange Rates"
                  active={activeItem === "exchange-rate"}
                  onClick={() => navigate("/exchange-rate-history")}
                />
              )}

              {/* Logout usually allowed for all authenticated users */}
              <SubItem
                label="Logout"
                active={false}
                onClick={handleLogout}
              />

            </SubMenu>
          )}

      </div>
    </aside>
  );
}

/* ---------------- Components (Light Theme) ---------------- */

function MenuItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl mb-1 transition-all
        ${active
          ? "bg-sky-500 text-white shadow-lg shadow-sky-100 font-bold"
          : "text-slate-600 hover:bg-sky-50 hover:text-sky-600"
        }`}
    >
      <span className={`${active ? "text-white" : "text-sky-500"}`}>{icon}</span>
      {label}
    </button>
  );
}

function SubMenu({ icon, label, open, onClick, children }) {
  return (
    <div className="mb-1">
      <button
        onClick={onClick}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all
          ${open ? "text-sky-600 bg-sky-50/50 font-bold" : "text-slate-600 hover:bg-sky-50"}`}
      >
        <span className="flex items-center gap-3">
          <span className="text-sky-500">{icon}</span>
          {label}
        </span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} className="text-gray-300" />}
      </button>

      {open && (
        <div className="ml-9 mt-1 border-l border-sky-100 pl-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SubItem({ label, active, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all
        ${active
          ? "text-sky-600 font-bold bg-sky-50"
          : danger
            ? "text-rose-500 hover:bg-rose-50"
            : "text-slate-500 hover:text-sky-600 hover:bg-sky-50/50"
        }`}
    >
      • {label}
    </button>
  );
}