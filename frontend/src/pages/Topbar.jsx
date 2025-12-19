import { Search, Plus, User, ShoppingCart, Bell } from "lucide-react";

export default function Topbar({ user }) {
  return (
    <header className="h-16 bg-sky-600 flex items-center justify-between px-6 shadow-md text-white">
      
      {/* Search - Vibrant & Integrated */}
      <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl w-96 border border-white/30 focus-within:bg-white focus-within:border-white transition-all group">
        <Search size={18} className="text-white group-focus-within:text-sky-600" />
        <input
          placeholder="Search for medicines..."
          className="bg-transparent outline-none text-sm w-full text-white placeholder-white/70 group-focus-within:text-gray-800 group-focus-within:placeholder-gray-400 font-medium"
        />
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        
        {/* POS Button - High Contrast Dark */}
        <button className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-black/20 active:scale-95">
          <ShoppingCart size={18} strokeWidth={2.5} /> 
          <span>POS SYSTEM</span>
        </button>

        {/* Add New Button - Clean White */}
        <button className="bg-white hover:bg-gray-100 text-sky-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
          <Plus size={18} strokeWidth={3} /> 
          <span>Add New</span>
        </button>

        {/* Notifications */}
        <button className="p-2 hover:bg-white/10 rounded-full transition-all relative">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-sky-600"></span>
        </button>

        {/* Separator */}
        <div className="h-8 w-[1px] bg-white/30 mx-1" />

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold leading-none">{user?.name || "Admin User"}</p>
            <p className="text-[10px] text-sky-100 font-medium uppercase tracking-widest mt-1">Pharmacist</p>
          </div>
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-105 transition-transform">
            <User size={22} strokeWidth={2.5} />
          </div>
        </div>

      </div>
    </header>
  );
}