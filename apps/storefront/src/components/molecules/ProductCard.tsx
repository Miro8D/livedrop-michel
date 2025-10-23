import LazyImage from '../atoms/LazyImage';
import { formatCurrency } from '../../lib/format';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  stockQty?: number;
};

export default function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const outOfStock = typeof product.stockQty === 'number' && product.stockQty <= 0;
  return (
    <article className="bg-white/80 rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 w-full mb-3 overflow-hidden rounded">
        {product.image ? (
          <LazyImage src={product.image} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">No image</div>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
      <div className="text-blue-600 font-bold mb-3">{formatCurrency(product.price)}</div>
      <div className="mt-auto">
        <button
          onClick={onAdd}
          disabled={outOfStock}
          className={`w-full px-4 py-2 rounded ${outOfStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {outOfStock ? 'Out of Stock' : 'Quick Add to Cart'}
        </button>
      </div>
    </article>
  );
}
