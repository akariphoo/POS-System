const PolicyItem = ({ met, label }) => (
  <div className={`flex items-center gap-1 text-[10px] font-bold ${met ? 'text-emerald-500' : 'text-gray-400'}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-emerald-500' : 'bg-gray-300'}`} />
    {label}
  </div>
);