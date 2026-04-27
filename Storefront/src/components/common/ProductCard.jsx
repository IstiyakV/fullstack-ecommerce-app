import { Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { encodeId } from '../../utils/hashId';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return 'https://placehold.co/300x300/f5f5f5/cccccc?text=No+Image';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  
  const selling = parseFloat(product.selling_price) || 0;
  const regular = parseFloat(product.regular_price) || 0;
  const discount = regular > selling ? Math.round(((regular - selling) / regular) * 100) : 0;
  const rating = parseFloat(product.product_rating) || 0;
  
  const inWishlist = isInWishlist(product.product_id);

  return (
    <Link to={`/products/${product.product_slug}-i${encodeId(product.product_id)}.html`} className="product-card">
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={resolveImage(product.featured_image)}
          alt={product.product_name}
          loading="lazy"
        />
        {discount > 0 && (
          <span className="product-card__discount-badge">-{discount}%</span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevent navigating to product detail
            toggleItem(product);
          }}
          style={{
            position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px',
            borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 10,
            transform: inWishlist ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s',
            color: inWishlist ? '#ef4444' : '#9ca3af'
          }}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = inWishlist ? 'scale(1.05)' : 'scale(1)'; }}
        >
          <FiHeart size={16} fill={inWishlist ? '#ef4444' : 'none'} strokeWidth={inWishlist ? 0 : 2} />
        </button>
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.product_name}</p>
        <div className="flex items-center gap-1">
          <span className="product-card__price">৳{selling.toLocaleString()}</span>
          {discount > 0 && (
            <span className="product-card__original-price">৳{regular.toLocaleString()}</span>
          )}
        </div>
        {rating > 0 && (
          <div className="product-card__rating">
            <div className="product-card__stars">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={11} fill={s <= rating ? '#FBBF24' : 'none'} color={s <= rating ? '#FBBF24' : '#D1D5DB'} />
              ))}
            </div>
            <span>({Math.floor(rating * 10)})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
