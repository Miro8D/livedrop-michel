import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCartStore } from '../lib/store';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  description?: string;
  tags?: string[];
  stockQty?: number;
  imageURL?: string;
};

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { add: addToCart } = useCartStore();

  useEffect(() => {
    fetch("/mock-catalog.json")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setAllProducts(data);
        const item = data.find((p) => p.id === id);
        if (item) {
          setProduct(item);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [id]);

  // Find related products based on shared tags
  const relatedProducts = useMemo(() => {
    if (!product || !product.tags) return [];

    return allProducts
      .filter(p => p.id !== product.id && p.tags) // Exclude current product and products without tags
      .map(p => ({
        ...p,
        sharedTags: p.tags!.filter(tag => product.tags!.includes(tag)).length
      }))
      .filter(p => p.sharedTags > 0) // Only products with at least one shared tag
      .sort((a, b) => b.sharedTags - a.sharedTags) // Sort by number of shared tags
      .slice(0, 3) // Take top 3
      .map(({ sharedTags, ...p }) => p); // Remove sharedTags count
  }, [product, allProducts]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (notFound || !product) {
    return (
      <main className="w-full px-4 py-12 text-center bg-transparent">
        <h1 className="text-xl font-bold mb-4">Product not found</h1>
        <Link to="/" className="text-blue-600 underline">
          Back to Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-8 bg-transparent">
      <button
        className="mb-6 inline-flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
        onClick={() => navigate(-1)}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-96">
            <img
              src={product.imageURL || product.image}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </div>
          <section className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>
            <div className="text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold mb-6">
              ${product.price.toFixed(2)}
            </div>
          {product.tags && (
            <div className="mb-3 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-500/30 text-blue-200 text-sm rounded-full font-medium backdrop-blur-sm border border-blue-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mb-6 text-white/80 text-lg leading-relaxed">
            {product.description || (
              <span className="italic text-white/40">No description available.</span>
            )}
          </div>
          {typeof product.stockQty === "number" && (
            <div className="mb-6 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${product.stockQty > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-white/70">
                {product.stockQty > 0 ? `In stock: ${product.stockQty} units` : 'Out of stock'}
              </span>
            </div>
          )}
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-blue-500/25"
            disabled={product.stockQty === 0}
            onClick={() => {
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                qty: quantity,
                image: product.imageURL || product.image
              });
              navigate('/cart');
            }}
          >
            {product.stockQty === 0 ? "Out of Stock" : (
              <>Add {quantity} to Cart - ${(product.price * quantity).toFixed(2)}</>
            )}
          </button>
          {product.stockQty !== 0 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition-all duration-300"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="text-white text-lg font-semibold min-w-[3ch] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQty || 99, quantity + 1))}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition-all duration-300"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
          </section>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">You might also like</h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 w-full space-y-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/p/${relatedProduct.id}`}
                className="group bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 border border-white/20 hover:border-blue-400/50 overflow-hidden hover:scale-105 break-inside-avoid mb-6 block"
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <img
                    src={relatedProduct.imageURL || relatedProduct.image}
                    alt={relatedProduct.title}
                    className="w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent group-hover:from-blue-900/60 transition-all duration-500"></div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors mb-2">
                    {relatedProduct.title}
                  </h3>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                    ${relatedProduct.price.toFixed(2)}
                  </div>
                  {relatedProduct.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {relatedProduct.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full font-medium backdrop-blur-sm border border-blue-400/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Product;
