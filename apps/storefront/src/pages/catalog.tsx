import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from '../lib/store';
import LazyImage from "../components/atoms/LazyImage";

// Product type based on mock-catalog.json shape
type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  tags?: string[];
  stockQty?: number;
  description?: string;
  imageURL?: string;
};

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const { add: addToCart } = useCartStore();

  useEffect(() => {
    fetch("/mock-catalog.json")
      .then((res) => {
        console.log('Fetch response:', res);
        return res.json();
      })
      .then((data) => {
        console.log('Fetched data:', data);
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching catalog:', error);
        setLoading(false);
      });
  }, []);

  // Get unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(product => {
      product.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Tag filter
      const matchesTag = selectedTag === '' || product.tags?.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedTag, sortBy]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  console.log('Rendering catalog with products:', products);

  return (
    <main className="w-full px-4 py-8 bg-transparent">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          Our Products
        </h1>
        <p className="text-slate-700 text-xl">Discover our amazing selection of electronics and accessories</p>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 mb-12">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            />
          </div>
          
          {/* Tag Filter */}
          <div className="sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            >
              <option value="" className="bg-white text-slate-800">All Categories</option>
              {allTags.map(tag => (
                <option key={tag} value={tag} className="bg-white text-slate-800">
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort Options */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            >
              <option value="name-asc" className="bg-white text-slate-800">Name (A-Z)</option>
              <option value="name-desc" className="bg-white text-slate-800">Name (Z-A)</option>
              <option value="price-asc" className="bg-white text-slate-800">Price (Low to High)</option>
              <option value="price-desc" className="bg-white text-slate-800">Price (High to Low)</option>
            </select>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="text-sm text-slate-600 mt-4">
          Showing {filteredAndSortedProducts.length} of {products.length} products
          {searchTerm && (
            <span> for "{searchTerm}"</span>
          )}
          {selectedTag && (
            <span> in {selectedTag}</span>
          )}
        </div>
      </div>
      
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 w-full space-y-6">
        {filteredAndSortedProducts.map((product) => (
          <div key={product.id} className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all duration-500 border border-slate-200 hover:border-blue-400/50 overflow-hidden hover:scale-105 break-inside-avoid mb-6">
            <Link to={`/p/${product.id}`}>
              <div className="relative overflow-hidden bg-slate-50">
                <LazyImage
                  src={product.imageURL || product.image}
                  alt={product.title}
                  className="w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  width={300}
                  height={300}
                  fetchPriority="low"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent group-hover:from-slate-900/30 transition-all duration-500"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">{product.title}</h2>
                <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent mb-3">${product.price.toFixed(2)}</div>
                {product.tags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium border border-blue-200">{tag}</span>
                    ))}
                  </div>
                )}
                {typeof product.stockQty === "number" && (
                  <div className="mt-2 text-xs text-slate-500">
                    In stock: {product.stockQty}
                  </div>
                )}
              </div>
            </Link>
            <div className="px-6 pb-6">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (product.stockQty !== 0) {
                    addToCart({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.imageURL || product.image,
                      qty: 1
                    });
                  }
                }}
                disabled={product.stockQty === 0}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
              >
                {product.stockQty === 0 ? "Out of Stock" : "Quick Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Catalog;
