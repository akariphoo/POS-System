import { useState, useEffect } from "react";
import {
    History, Plus, Trash2, Edit, Clock, CheckCircle2,
    X, Save, AlertCircle, CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function ExchangeRateHistory() {
    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [errors, setErrors] = useState({}); // To hold backend validation errors

    const [formData, setFormData] = useState({
        base_currency: "CNY",
        quote_currency: "MMK",
        rate: "",
        status: "active",
        effective_from: new Date().toISOString().slice(0, 16),
        effective_to: "",
    });

    const fetchHistory = async () => {
        try {
            const res = await api.post("/exchange-rate/list");
            console.log(res.data.data);
            if (res.data.status) setHistory(res.data.data);
        } catch {
            toast.error("Failed to load history");
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors
        try {
            const res = await api.post("/exchange-rate/store", formData);
            if (res.data.status) {
                toast.success("Rate updated successfully");
                setIsModalOpen(false);
                fetchHistory();
            }
        } catch (err) {
            if (err.response?.status === 422) {
                // Capture Laravel validation errors
                setErrors(err.response.data.errors || {});
                toast.error("Please check the highlighted fields");
            } else {
                toast.error(err.response?.data?.message || "Operation failed");
            }
        }
    };

    // Utility to render error messages
    const ErrorMsg = ({ field }) => (
        errors[field] ? <p className="text-[10px] text-rose-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">{errors[field][0]}</p> : null
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            {/* Header section remains the same */}
            <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Exchange Rates</h2>
                    <p className="text-sm text-gray-500">Manage currency conversion and history tracking</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ base_currency: "CNY", quote_currency: "MMK", rate: "", status: "active", effective_from: new Date().toISOString().slice(0, 16), effective_to: "" });
                        setErrors({});
                        setIsModalOpen(true);
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-sky-100"
                >
                    <Plus size={20} /> Update Rate
                </button>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                            <th className="p-5 pl-8">Valid From</th>
                            <th className="p-5">Valid Until</th>
                            <th className="p-5">Pair</th>
                            <th className="p-5">Rate</th>
                            <th className="p-5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-5 pl-8 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-sky-400" />
                                        {new Date(item.effective_from).toLocaleString()}
                                    </div>
                                </td>
                                <td className="p-5 text-sm text-gray-500">
                                    {item.effective_to ? (
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={14} className="text-rose-300" />
                                            {new Date(item.effective_to).toLocaleString()}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 italic">Current</span>
                                    )}
                                </td>
                                <td className="p-5 font-bold text-gray-700">
                                    {item.base_currency} / {item.quote_currency}
                                </td>
                                <td className="p-5 font-mono font-bold text-sky-600">
                                    {parseFloat(item.rate).toFixed(4)}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Set Exchange Rate</h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Base Currency Input */}
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Base Currency (China) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            className={`w-full border p-3 rounded-xl mt-1 outline-none transition-all pr-12 ${errors.base_currency ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-sky-500'}`}
                                            value={formData.base_currency}
                                            onChange={(e) => setFormData({ ...formData, base_currency: e.target.value.toUpperCase() })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/4 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            ¥ CNY
                                        </span>
                                    </div>
                                    <ErrorMsg field="base_currency" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quote Currency <span className="text-rose-500">*</span></label>
                                    <input
                                        className={`w-full border p-3 rounded-xl mt-1 outline-none transition-all ${errors.quote_currency ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-sky-500'}`}
                                        value={formData.quote_currency}
                                        onChange={(e) => setFormData({ ...formData, quote_currency: e.target.value.toUpperCase() })}
                                    />
                                    <ErrorMsg field="quote_currency" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rate <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number" step="0.000001"
                                        className={`w-full border p-3 rounded-xl mt-1 outline-none transition-all ${errors.rate ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-sky-500'}`}
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    />
                                    <ErrorMsg field="rate" />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full border border-gray-200 p-3 rounded-xl mt-1 outline-none appearance-none bg-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Effective From <span className="text-rose-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        className={`w-full border p-3 rounded-xl mt-1 text-sm outline-none transition-all ${errors.effective_from ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-sky-500'}`}
                                        value={formData.effective_from}
                                        onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                                    />
                                    <ErrorMsg field="effective_from" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Effective To</label>
                                    <input
                                        type="datetime-local"
                                        className={`w-full border p-3 rounded-xl mt-1 text-sm outline-none transition-all ${errors.effective_to ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-sky-500'}`}
                                        value={formData.effective_to}
                                        onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                                    />
                                    <ErrorMsg field="effective_to" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-sky-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-sky-100 flex items-center justify-center gap-2 hover:bg-sky-600 transition-all"><Save size={18} /> Save Rate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}