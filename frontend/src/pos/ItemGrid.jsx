import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import ItemCard from "./ItemCard";

const sampleItems = [
  {
    id: 1,
    name: "Dinner Set Chair",
    price: 240.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 15,
  },
  {
    id: 2,
    name: "Luxury Plastic Chair",
    price: 360.0,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    stock: 8,
  },
  {
    id: 3,
    name: "PETE (Plastic Bottles)",
    price: 35000.0,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
    stock: 500,
  },
  {
    id: 4,
    name: "Plastic Chair Set",
    price: 120.0,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    stock: 25,
  },
  {
    id: 5,
    name: "Office Desk Chair",
    price: 450.0,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    stock: 12,
  },
  {
    id: 6,
    name: "Wooden Dining Table",
    price: 850.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 6,
  },
  {
    id: 7,
    name: "Modern Sofa Set",
    price: 1200.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 4,
  },
  {
    id: 8,
    name: "Glass Coffee Table",
    price: 320.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 10,
  },
  {
    id: 9,
    name: "Recliner Chair",
    price: 680.0,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    stock: 7,
  },
  {
    id: 10,
    name: "Bar Stool Set",
    price: 180.0,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    stock: 20,
  },
  {
    id: 11,
    name: "Bookshelf Unit",
    price: 290.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 9,
  },
  {
    id: 12,
    name: "TV Stand Cabinet",
    price: 420.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 11,
  },
  {
    id: 13,
    name: "Dining Chair Set (4pcs)",
    price: 380.0,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    stock: 14,
  },
  {
    id: 14,
    name: "Side Table",
    price: 150.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 18,
  },
  {
    id: 15,
    name: "Wardrobe Cabinet",
    price: 950.0,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    stock: 5,
  },
];

export default function ItemGrid({ onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const searchInputRef = useRef(null);

  const filteredItems = sampleItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery);
    return matchesSearch;
  });

  // Auto-focus search input on mount and when actions happen
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search input when '/' key is pressed (common search shortcut)
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    // Auto-focus on mount
    searchInputRef.current?.focus();

    // Add keyboard shortcut listener
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-focus when search query changes (after user actions)
  useEffect(() => {
    if (searchQuery) {
      searchInputRef.current?.focus();
    }
  }, [searchQuery]);

  return (
    <div>
      {/* Section Title */}
      <div className="mb-2.5 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6">
        <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 xs:mb-0.5 sm:mb-1">All Items</h2>
        <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-gray-500">Browse and add items to cart</p>
      </div>

      {/* Filter Bar - Optimized for Rapid Pharmacy POS */}
      <div className="flex flex-col md:flex-row items-stretch gap-2 sm:gap-3 mb-4 md:mb-6">
        
        {/* Search Container */}
        <div className="flex-1 relative group">
          <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={18} className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Scan barcode or search medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3.5 
                      bg-white border-2 border-gray-100 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      text-sm md:text-base placeholder:text-gray-400
                      shadow-sm hover:border-gray-300 transition-all cursor-text"
            autoFocus
          />
          {/* Rapid Clear Button (Visible only when searching) */}
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
            >
              <span className="text-xs font-bold">ESC</span>
            </button>
          )}
        </div>

        {/* Group Selector - Rapid Access */}
        <div className="flex gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="flex-1 md:w-56 px-4 md:px-5 py-2.5 md:py-3.5 
                      bg-white border-2 border-gray-100 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-blue-500 
                      text-sm md:text-base font-semibold text-gray-700
                      shadow-sm cursor-pointer appearance-none transition-all
                      hover:bg-gray-50"
          >
            <option value="all">📁 All Categories</option>
            <option value="antibiotics">Antibiotics</option>
            <option value="supplements">Supplements</option>
            <option value="first-aid">First Aid</option>
            <option value="skincare">Skincare</option>
          </select>
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}
