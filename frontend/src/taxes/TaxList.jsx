import { useEffect, useState } from "react";
import { Percent, Plus, Edit, Trash2, Calendar, User, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

export default function TaxList() {
    const [taxes, setTaxes] = useState([]);
    const [history, setHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        tax_name: "",
        tax_rate: "",
        status: "active",
        effective_from: new Date().toISOString().slice(0, 16),
    });

    const fetchData = async () => {
        try {
            const res = await api.get("/taxes");
            setTaxes(res.data.data.taxes);
            setHistory(res.data.data.all_history);
        } catch (err) { toast.error("Failed to load taxes"); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        try {
            const res = formData.id
                ? await api.put(`/taxes/${formData.id}`, formData)
                : await api.post("/taxes", formData);

            if (res.data.status) {
                toast.success("Tax record saved");
                setIsModalOpen(false);
                fetchData();
            }
        } catch (err) { toast.error("Check input fields"); }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Percent className="text-blue-600" /> Tax Management
                </h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                    <Plus size={18} /> New Tax Rate
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Taxes */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4 pl-6">Tax Name</th>
                                <th className="p-4">Rate (%)</th>
                                <th className="p-4">Effective From</th>
                                <th className="p-4">Effective To</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {taxes.map(t => (
                                <tr key={t.id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="font-bold text-slate-700">{t.history?.tax_name}</div>
                                        <div className="text-[10px] text-blue-500 font-bold uppercase">{t.history?.status}</div>
                                    </td>
                                    <td className="p-4 font-black text-slate-600">{t.history?.tax_rate}%</td>
                                    <td className="p-4 text-xs text-slate-400">{t.history?.effective_from}</td>
                                    <td className="p-4 text-xs text-slate-400">
                                        <div className="flex flex-col">
                                            <span>From: {new Date(t.history?.effective_from).toLocaleDateString()}</span>
                                            {t.history?.effective_to && (
                                                <span className="text-rose-400 font-bold">
                                                    To: {new Date(t.history?.effective_to).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => { setFormData({ ...t.history, id: t.id }); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* History Log */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-blue-600" /> Audit History
                    </h3>
                    <div className="space-y-4">
                        {history.map(h => (
                            <div key={h.id} className="border-l-2 border-blue-100 pl-4 py-1">
                                <div className="text-xs font-black text-slate-700">{h.tax_name} ({h.tax_rate}%)</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                    <Calendar size={10} /> {new Date(h.created_at).toLocaleDateString()}
                                    <User size={10} className="ml-2" /> ID: {h.user_id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                            <h3 className="font-black uppercase tracking-tight">Tax Configuration</h3>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Tax Identity</label>
                                <input type="text" value={formData.tax_name} onChange={e => setFormData({ ...formData, tax_name: e.target.value })} className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-600 outline-none" placeholder="e.g. VAT 10%" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Rate (%)</label>
                                    <input type="number" value={formData.tax_rate} onChange={e => setFormData({ ...formData, tax_rate: e.target.value })} className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-600 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-600 outline-none">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Effective From</label>
                                <input type="datetime-local" value={formData.effective_from} onChange={e => setFormData({ ...formData, effective_from: e.target.value })} className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-600 outline-none" />
                            </div>
                            <button onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                                CONFIRM TAX VERSION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}