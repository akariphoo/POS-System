export default function ItemCard({ item, onAddToCart }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      onClick={() => onAddToCart(item)}
      className="bg-white border border-gray-200 rounded-lg p-2 md:p-3 cursor-pointer 
                 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 
                 transition-all duration-200 group flex flex-col
                 /* Responsive Height */
                 h-[140px] xs:h-[160px] sm:h-[180px] md:h-[220px] lg:h-[240px]"
    >
      <div className="flex flex-row md:flex-col h-full gap-3 md:gap-2">
        
        {/* Product Image - Small on Mobile, Card-width on Desktop */}
        <div className="w-20 h-20 md:w-full md:h-32 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden shadow-inner">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/200x200?text=Medicine";
            }}
          />
        </div>

        {/* Item Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
              {item.name}
            </h3>
            {/* Added a Category or SKU label often used in Pharmacy POS */}
            <p className="hidden md:block text-[10px] text-gray-500 uppercase tracking-wider">
              {item.category || "General"}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto gap-2">
            <p className="text-sm md:text-base lg:text-lg font-bold text-blue-700 truncate">
              {formatCurrency(item.price)}
            </p>
            
            {item.stock !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                item.stock > 10 
                  ? "bg-green-100 text-green-700" 
                  : item.stock > 0 
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {item.stock} <span className="hidden sm:inline">left</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}