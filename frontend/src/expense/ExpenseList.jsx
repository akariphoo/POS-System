import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, X, Receipt, Calendar, Info, Loader2, AlertCircle, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import { hasPermission } from "../common/HasPermission";

export default function ExpenseList() {
  // State Management
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ categories: [], currencies: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    date: new Date().toISOString().split("T")[0],
    expense_category_id: "",
    description: "",
    amounts: [] // { currency_id, amount }
  });

  const loadData = useCallback(async (firstLoad = false) => {
    if (firstLoad) setLoading(true);
    try {
      const url = firstLoad ? "/expenses?include_meta=true" : "/expenses";
      const res = await api.get(url);
      const { expenses: expData, meta: metaData } = res.data.data;

      setExpenses(expData.data || expData);
      if (firstLoad && metaData) setMeta(metaData);
    } catch (err) {
      toast.error("Failed to sync with server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(true); }, [loadData]);

  const handleAmountChange = (currencyId, value) => {
    setFormData((prev) => {
      const otherAmounts = prev.amounts.filter(a => a.currency_id !== currencyId);
      return {
        ...prev,
        amounts: [...otherAmounts, { currency_id: currencyId, amount: parseFloat(value) || 0 }]
      };
    });
  };

  const openEditModal = (exp) => {
    setFormData({
      id: exp.id,
      date: exp.date,
      expense_category_id: exp.expense_category_id,
      description: exp.description || "",
      amounts: exp.expense_currencies.map(ec => ({
        currency_id: ec.currency_id,
        amount: ec.amount
      }))
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const hasValue = formData.amounts.some(a => a.amount > 0);
    if (!formData.expense_category_id || !hasValue) {
      return toast.error("Please select a category and enter an amount");
    }

    setIsProcessing(true);
    try {
      const isUpdate = !!formData.id;
      const res = isUpdate
        ? await api.put(`/expenses/${formData.id}`, formData)
        : await api.post("/expenses", formData);

      if (res.data.status) {
        toast.success(isUpdate ? "Expense updated" : "Expense recorded");
        closeModal();
        loadData(false);
      }
    } catch (err) {
      toast.error("Check your input data");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDelete = async () => {
    setIsProcessing(true);
    try {
      await api.delete(`/expenses/${targetId}`);
      toast.success("Record removed");
      loadData(false);
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, date: new Date().toISOString().split("T")[0], expense_category_id: "", description: "", amounts: [] });
  };

  const formatNum = (num) => new Intl.NumberFormat().format(num);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
      <p className="text-gray-400 font-medium">Loading Financial Records...</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#f0f4f8] min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-t-2xl border-b shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Receipt className="text-blue-600" /> Expense Tracker
          </h1>
          <p className="text-sm text-gray-400 font-medium">Manage and monitor daily business spending</p>
        </div>
        {hasPermission('expense.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Create New Expense
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-b-2xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
              <th className="p-5 pl-8">Date / Category</th>
              <th className="p-5">Description</th>
              <th className="p-5">Payment Breakdown</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="p-5 pl-8">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" /> {exp.date}
                    </span>
                    <span className="text-[11px] font-black text-blue-600 uppercase mt-1 tracking-tight">
                      {exp.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </td>
                <td className="p-5 text-sm text-gray-500 italic max-w-xs truncate">{exp.description || "—"}</td>
                <td className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {exp.expense_currencies?.map((ec) => (
                      <div key={ec.id} className="flex items-center bg-white border border-blue-100 px-2.5 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[10px] font-black text-blue-400 mr-2 border-r border-blue-50 pr-2 uppercase">{ec.currency?.name}</span>
                        <span className="text-sm font-bold text-blue-700">{formatNum(ec.amount)}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-1">
                    {hasPermission('expense.edit') && (
                      <button onClick={() => openEditModal(exp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                    )}
                    {hasPermission('expense.delete') && (
                      <button onClick={() => { setTargetId(exp.id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 bg-blue-600 text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">{formData.id ? "Update Expense" : "New Expense"}</h3>
              <button onClick={closeModal} className="hover:bg-white/20 rounded-full p-1"><X /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Spending Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Category</label>
                  <select value={formData.expense_category_id} onChange={e => setFormData({ ...formData, expense_category_id: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-600 transition-colors">
                    <option value="">— Select —</option>
                    {meta.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border-2 border-dashed border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Amount Input</p>
                <div className="space-y-3">
                  {meta.currencies.map(curr => {
                    const existingAmt = formData.amounts.find(a => a.currency_id === curr.id)?.amount || "";
                    return (
                      <div key={curr.id} className="flex items-center bg-white p-1.5 rounded-xl border border-blue-50 shadow-sm">
                        <span className="w-16 text-center font-black text-xs text-blue-600">{curr.name}</span>
                        <input
                          type="number"
                          value={existingAmt}
                          placeholder="0.00"
                          className="flex-1 p-2 bg-transparent outline-none font-bold text-gray-700"
                          onChange={(e) => handleAmountChange(curr.id, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <textarea placeholder="Purchase notes..." className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-600 min-h-[90px] text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

              <button disabled={isProcessing} onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex justify-center">
                {isProcessing ? <Loader2 className="animate-spin" /> : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-400 mb-8 font-medium">This record will be permanently deleted from the financial history.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={executeDelete} disabled={isProcessing} className="py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 flex justify-center">
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}