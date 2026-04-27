import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { decodeId, encodeId } from '../utils/hashId';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const match = slug?.match(/-i([\w]+)(?:-s[\w]+)?\.html$/);
  const parsedEncodedId = match ? match[1] : slug; // fallback if URL is standard id
  const id = decodeId(parsedEncodedId);

  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [variantTypes, setVariantTypes] = useState([]);
  const [skus, setSkus] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef(null);

  // Variant state
  const [selectedOptions, setSelectedOptions] = useState({});
  const [matchedSku, setMatchedSku] = useState(null);
  const [qty, setQty] = useState(1);

  // Sticky bar
  const [showSticky, setShowSticky] = useState(false);
  const actionsRef = useRef(null);

  // ── Fetch Product ───────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/customer/product-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          setProduct(data.data);
          const productImages = data.images || [];
          setImages(productImages);
          setVariantTypes(data.variant_types || []);
          setSkus(data.skus || []);
          setRelatedProducts(data.related_products || []);
          setReviews(data.reviews || []);
          setReviewSummary(data.review_summary || null);

          // Auto-select default (or first) option of each variant type
          const defaultSelections = {};
          let firstGallery = null;
          (data.variant_types || []).forEach(vt => {
            if (vt.options && vt.options.length > 0) {
              const defaultOpt = vt.options.find(o => o.is_default === '1') || vt.options[0];
              defaultSelections[vt.type_name] = {
                value: defaultOpt.option_value,
                image: defaultOpt.option_image,
              };
              // Use the first variant type's default gallery for initial display
              if (!firstGallery && defaultOpt.gallery_images && defaultOpt.gallery_images.length > 0) {
                firstGallery = defaultOpt.gallery_images;
              }
            }
          });
          setSelectedOptions(defaultSelections);
          // Swap gallery to the default variant's images
          if (firstGallery) {
            setImages(firstGallery.map((url, i) => ({
              image_id: `gal-${i}`,
              image_url: url,
              sort_order: i.toString(),
              is_primary: i === 0 ? '1' : '0',
            })));
            setActiveImageIndex(0);
          }
        }
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ── Match SKU When Selections Change ────────────────────────────────
  useEffect(() => {
    if (skus.length === 0 || variantTypes.length === 0) {
      setMatchedSku(null);
      return;
    }
    // Find SKU matching all selected values
    const matched = skus.find(sku => {
      try {
        const combo = JSON.parse(sku.combination);
        return Object.entries(selectedOptions).every(
          ([type, opt]) => combo[type] === opt.value
        );
      } catch { return false; }
    });
    setMatchedSku(matched && matched.is_active === '1' ? matched : null);
  }, [selectedOptions, skus, variantTypes]);

  // ── Sticky Bar Observer ─────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    const el = actionsRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [product]);

  // ── Helper: Get Display Price ───────────────────────────────────────
  const getDisplayPrice = useCallback(() => {
    if (matchedSku) return matchedSku.price;
    return product?.selling_price || '0';
  }, [matchedSku, product]);

  const getDisplayStock = useCallback(() => {
    if (matchedSku) return parseInt(matchedSku.stock) || 0;
    if (skus.length > 0 && variantTypes.length > 0) return 0; // Has variants but no match
    return parseInt(product?.stock) || 0;
  }, [matchedSku, product, skus, variantTypes]);

  const getDisplayRegularPrice = useCallback(() => {
    if (matchedSku && matchedSku.regular_price) return matchedSku.regular_price;
    return product?.regular_price;
  }, [matchedSku, product]);

  const getDisplaySku = useCallback(() => {
    if (matchedSku) return matchedSku.sku_code;
    return product?.sku_code || '';
  }, [matchedSku, product]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleSelectVariant = (typeName, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [typeName]: { value: option.option_value, image: option.option_image },
    }));
    // If this option has gallery images, swap the product gallery
    if (option.gallery_images && option.gallery_images.length > 0) {
      setImages(option.gallery_images.map((url, i) => ({
        image_id: `gal-${i}`,
        image_url: url,
        sort_order: i.toString(),
        is_primary: i === 0 ? '1' : '0',
      })));
      setActiveImageIndex(0);
    } else if (option.option_image) {
      const idx = images.findIndex(img => img.image_url === option.option_image);
      if (idx >= 0) setActiveImageIndex(idx);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (variantTypes.length > 0 && !matchedSku) {
      alert('Please select all variant options');
      return;
    }
    const variantLabel = Object.entries(selectedOptions).map(([k,v]) => v.value).join(' / ');
    addItem({
      product_id: product.product_id,
      product_name: matchedSku ? `${product.product_name} - ${variantLabel}` : product.product_name,
      product_slug: product.product_slug || slug, // fallback string so Cart has it
      featured_image: product.featured_image,
      selling_price: parseFloat(getDisplayPrice()),
      regular_price: parseFloat(product.regular_price || product.selling_price),
      quantity: qty,
      shop_name: product.shop_name,
      sku: getDisplaySku(),
      variantInfo: Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v.value}`).join(', '),
    });
  };

  const handleZoomMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // ── Parse Highlights ────────────────────────────────────────────────
  const highlights = (() => {
    try { return JSON.parse(product?.highlights || '[]'); } catch { return []; }
  })();

  // ── Loading / Error ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container">
        <div className="pd-skeleton">
          <div className="pd-skeleton__gallery" />
          <div className="pd-skeleton__info"><div /><div /><div /><div /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><h2>Product not found</h2></div>;
  }

  const sellingPrice = getDisplayPrice();
  const regularPrice = getDisplayRegularPrice();
  let discount = 0;
  if (regularPrice && parseFloat(regularPrice) > parseFloat(sellingPrice)) {
    discount = Math.round(((parseFloat(regularPrice) - parseFloat(sellingPrice)) / parseFloat(regularPrice)) * 100);
  } else if (!matchedSku && product?.discount_rate) {
    discount = parseInt(product.discount_rate) || 0;
  }
  const stock = getDisplayStock();
  const hasVariants = variantTypes.length > 0;

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span className="pd-breadcrumb__sep">›</span>
        <Link to={`/products?category=${product.category_id}`}>{product.category_name_en || 'Products'}</Link>
        <span className="pd-breadcrumb__sep">›</span>
        <span className="pd-breadcrumb__current">{product.product_name}</span>
      </nav>

      {/* ── Main Layout ──────────────────────────────────────────────── */}
      <div className="pd-layout">
        {/* ── Gallery ──────────────────────────────────────────────── */}
        <div className="pd-gallery">
          <div className="pd-gallery__row">
            {/* Vertical Thumbnails (desktop) */}
            <div className="pd-gallery__thumbs-vertical">
              {images.map((img, i) => (
                <button key={i} className={`pd-gallery__thumb ${i === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(i)}>
                  <img src={resolveImage(img.image_url)} alt="" />
                </button>
              ))}
            </div>

            {/* Main Image with Zoom */}
            <div className="pd-gallery__main" ref={mainImageRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleZoomMove}>
              <img className="pd-gallery__img" src={resolveImage(images[activeImageIndex]?.image_url || product.featured_image)} alt={product.product_name} />
              {discount > 0 && <span className="pd-gallery__badge">-{discount}%</span>}
              {isZoomed && (
                <div className="pd-gallery__zoom" style={{
                  backgroundImage: `url(${resolveImage(images[activeImageIndex]?.image_url || product.featured_image)})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }} />
              )}
            </div>
          </div>

          {/* Horizontal Thumbnails (mobile) */}
          <div className="pd-gallery__thumbs-horizontal">
            {images.map((img, i) => (
              <button key={i} className={`pd-gallery__thumb ${i === activeImageIndex ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(i)}>
                <img src={resolveImage(img.image_url)} alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Product Info ────────────────────────────────────────── */}
        <div className="pd-info">
          <h1 className="pd-info__name">{product.product_name}</h1>

          {product.brand_name && (
            <div className="pd-info__brand">Brand: <span>{product.brand_name}</span></div>
          )}

          {/* Rating + Sold */}
          <div className="pd-info__rating-row">
            <div className="pd-info__stars">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`pd-star ${s <= Math.round(parseFloat(product.product_rating || '0')) ? 'pd-star--filled' : ''}`}>★</span>
              ))}
              <span className="pd-info__rating-value">{parseFloat(product.product_rating || '0').toFixed(1)}</span>
            </div>
            {reviewSummary && reviewSummary.total_reviews > 0 && (
              <button className="pd-info__rating-count" onClick={() => setActiveTab('reviews')}>({reviewSummary.total_reviews} ratings)</button>
            )}
            {parseInt(product.total_sold) > 0 && (
              <>
                <span className="pd-info__divider">|</span>
                <span className="pd-info__sold">{product.total_sold}+ sold</span>
              </>
            )}
          </div>

          {/* Price Block */}
          <div className="pd-info__price-block">
            <span className="pd-info__price">৳{parseFloat(sellingPrice).toLocaleString()}</span>
            {regularPrice && parseFloat(regularPrice) > parseFloat(sellingPrice) && (
              <span className="pd-info__original">৳{parseFloat(regularPrice).toLocaleString()}</span>
            )}
            {discount > 0 && <span className="pd-info__discount">-{discount}%</span>}
          </div>

          {/* SKU */}
          <div className="pd-info__sku">SKU: <span>{getDisplaySku() || '—'}</span></div>

          {/* ── Variant Selectors ──────────────────────────────────── */}
          {hasVariants && (
            <div className="pd-variants">
              {variantTypes.map(vt => (
                <div key={vt.type_id} className="pd-variant-group">
                  <div className="pd-variant-group__label">
                    {vt.type_name}: <strong>{selectedOptions[vt.type_name]?.value || '—'}</strong>
                  </div>
                  <div className="pd-variant-group__options">
                    {vt.options.map(opt => {
                      const isSelected = selectedOptions[vt.type_name]?.value === opt.option_value;
                      const isColor = vt.type_name.toLowerCase().includes('color') || vt.type_name.toLowerCase().includes('colour');
                      
                      // Prefer the first gallery image over the default option image
                      const displayImage = opt.gallery_images?.length > 0 ? opt.gallery_images[0] : opt.option_image;
                      const isFallbackImage = displayImage === product.featured_image;
                      
                      // Only show image thumbnail if:
                      // 1. It has an image AND it's a Color attribute
                      // 2. OR it has an image that is explicitly unique (not just the fallback main image)
                      const hasImage = !!displayImage && (isColor || !isFallbackImage);
                      // Find min price for this option
                      const optSkus = skus.filter(s => {
                        try { const c = JSON.parse(s.combination); return c[vt.type_name] === opt.option_value && s.is_active === '1'; } catch { return false; }
                      });
                      const minPrice = optSkus.length > 0 ? Math.min(...optSkus.map(s => parseFloat(s.price))) : null;

                      if (hasImage) {
                        // Amazon-style thumbnail card
                        return (
                          <button key={opt.option_id} className={`pd-variant-card ${isSelected ? 'pd-variant-card--active' : ''}`}
                            onClick={() => handleSelectVariant(vt.type_name, opt)}>
                            <img src={resolveImage(displayImage)} alt={opt.option_value} />
                            {minPrice !== null && <span className="pd-variant-card__price">৳{minPrice.toLocaleString()}</span>}
                            <span className="pd-variant-card__label">{opt.option_value}</span>
                          </button>
                        );
                      }

                      // Pill button (Size/Storage)
                      return (
                        <button key={opt.option_id} className={`pd-variant-pill ${isSelected ? 'pd-variant-pill--active' : ''}`}
                          onClick={() => handleSelectVariant(vt.type_name, opt)}>
                          {opt.option_value}
                          {minPrice !== null && minPrice !== parseFloat(product.selling_price) && (
                            <span className="pd-variant-pill__price">৳{minPrice.toLocaleString()}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Unavailable combo message */}
              {hasVariants && Object.keys(selectedOptions).length === variantTypes.length && !matchedSku && (
                <div className="pd-variant-unavailable">⚠ This combination is not available</div>
              )}
            </div>
          )}

          {/* ── Highlights ─────────────────────────────────────────── */}
          {highlights.length > 0 && (
            <div className="pd-highlights">
              <h4 className="pd-highlights__title">Highlights</h4>
              <ul>
                {highlights.map((h, i) => (
                  <li key={i}><span className="pd-highlights__icon">✓</span> {h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Quantity + Actions ──────────────────────────────────── */}
          <div className="pd-info__qty-row" ref={actionsRef}>
            <div className="pd-info__qty">
              <span className="pd-info__qty-label">Quantity:</span>
              <button className="pd-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="pd-qty-value">{qty}</span>
              <button className="pd-qty-btn" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            {stock > 0 && <span className="pd-info__stock-badge pd-info__stock-badge--in">In Stock ({stock})</span>}
            {stock === 0 && !hasVariants && <span className="pd-info__stock-badge pd-info__stock-badge--out">Out of Stock</span>}
            {hasVariants && !matchedSku && Object.keys(selectedOptions).length === variantTypes.length && (
              <span className="pd-info__stock-badge pd-info__stock-badge--out">Unavailable</span>
            )}
          </div>

          <div className="pd-info__actions">
            <button className="pd-btn pd-btn--cart" onClick={handleAddToCart} disabled={stock === 0}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Add to Cart
            </button>
            <button className="pd-btn pd-btn--buy" onClick={() => { handleAddToCart(); navigate('/cart'); }} disabled={stock === 0}>
              ⚡ Buy Now
            </button>
          </div>

          {/* ── Delivery / Trust / Seller ───────────────────────────── */}
          <div className="pd-services">
            <div className="pd-service-item">
              <span className="pd-service-item__icon">🚚</span>
              <div>
                <strong>Estimated Delivery</strong>
                <p>3-5 business days to Dhaka</p>
              </div>
            </div>
            {product.return_policy && (
              <div className="pd-service-item">
                <span className="pd-service-item__icon">🔄</span>
                <div>
                  <strong>Easy Return</strong>
                  <p>{product.return_policy}</p>
                </div>
              </div>
            )}
            {product.warranty_info && (
              <div className="pd-service-item">
                <span className="pd-service-item__icon">✅</span>
                <div>
                  <strong>Warranty</strong>
                  <p>{product.warranty_info}</p>
                </div>
              </div>
            )}
            <div className="pd-service-item">
              <span className="pd-service-item__icon">🛡️</span>
              <div>
                <strong>100% Authentic</strong>
                <p>Genuine products guaranteed</p>
              </div>
            </div>
          </div>

          {/* Seller */}
          {product.shop_name && (
            <div className="pd-seller">
              <div className="pd-seller__avatar">{product.shop_name.charAt(0)}</div>
              <div className="pd-seller__info">
                <strong>{product.shop_name}</strong>
                {product.shop_rating && <span className="pd-seller__rating">★ {product.shop_rating}</span>}
              </div>
              <button className="pd-seller__visit">Visit Store</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="pd-tabs">
        <div className="pd-tabs__nav">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button key={tab} className={`pd-tabs__tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'reviews' && reviewSummary ? ` (${reviewSummary.total_reviews})` : ''}
            </button>
          ))}
        </div>
        <div className="pd-tabs__content">
          {activeTab === 'description' && (
            <div className="pd-tab-panel" dangerouslySetInnerHTML={{ __html: product.product_details || '<p>No description available.</p>' }} />
          )}
          {activeTab === 'specifications' && (
            <div className="pd-tab-panel pd-tab-panel--specs" dangerouslySetInnerHTML={{ __html: product.product_specification || '<p>No specifications available.</p>' }} />
          )}
          {activeTab === 'reviews' && (
            <div className="pd-tab-panel">
              {/* Review Summary */}
              {reviewSummary && reviewSummary.total_reviews > 0 ? (
                <>
                  <div className="pd-review-summary">
                    <div className="pd-review-summary__left">
                      <div className="pd-review-summary__avg">{reviewSummary.average_rating}</div>
                      <div className="pd-review-summary__stars">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={`pd-star ${s <= Math.round(reviewSummary.average_rating) ? 'pd-star--filled' : ''}`}>★</span>
                        ))}
                      </div>
                      <div className="pd-review-summary__count">{reviewSummary.total_reviews} ratings</div>
                    </div>
                    <div className="pd-review-summary__bars">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviewSummary.star_distribution[star] || 0;
                        const pct = reviewSummary.total_reviews > 0 ? (count / reviewSummary.total_reviews) * 100 : 0;
                        return (
                          <div key={star} className="pd-review-bar">
                            <span className="pd-review-bar__label">{star}★</span>
                            <div className="pd-review-bar__track">
                              <div className="pd-review-bar__fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="pd-review-bar__count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="pd-reviews-list">
                    {reviews.map(r => (
                      <div key={r.review_id} className="pd-review-card">
                        <div className="pd-review-card__header">
                          <div className="pd-review-card__avatar">{(r.customer_name || 'U').charAt(0)}</div>
                          <div className="pd-review-card__meta">
                            <strong>{r.customer_name || 'Anonymous'}</strong>
                            <div className="pd-review-card__date">
                              {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <div className="pd-review-card__right">
                            <div className="pd-review-card__stars">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} className={`pd-star-sm ${s <= parseInt(r.rating) ? 'pd-star-sm--filled' : ''}`}>★</span>
                              ))}
                            </div>
                            {r.verified_purchase === '1' && <span className="pd-review-card__verified">✅ Verified</span>}
                          </div>
                        </div>
                        {r.title && <div className="pd-review-card__title">"{r.title}"</div>}
                        <p className="pd-review-card__body">{r.comment}</p>
                        {r.helpful_count > 0 && (
                          <div className="pd-review-card__helpful">👍 {r.helpful_count} {r.helpful_count === 1 ? 'person' : 'people'} found this helpful</div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="pd-reviews-empty">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products ───────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="pd-related">
          <div className="pd-related__header">
            <h3>Related Products</h3>
            <Link to={`/products?category=${product.category_id}`} className="pd-related__see-all">See All ›</Link>
          </div>
          <div className="pd-related__scroll">
            {relatedProducts.map(rp => (
              <Link key={rp.product_id} to={`/products/${rp.product_slug}-i${encodeId(rp.product_id)}.html`} className="pd-related__card">
                <div className="pd-related__card-img">
                  <img src={resolveImage(rp.featured_image)} alt={rp.product_name} />
                  {parseInt(rp.discount_rate) > 0 && <span className="pd-related__card-badge">-{rp.discount_rate}%</span>}
                </div>
                <div className="pd-related__card-info">
                  <p className="pd-related__card-name">{rp.product_name}</p>
                  <div className="pd-related__card-price">
                    <span className="pd-related__card-selling">৳{parseFloat(rp.selling_price).toLocaleString()}</span>
                    {rp.regular_price && parseFloat(rp.regular_price) > parseFloat(rp.selling_price) && (
                      <span className="pd-related__card-regular">৳{rp.regular_price}</span>
                    )}
                  </div>
                  {rp.product_rating && (
                    <div className="pd-related__card-rating">
                      <span className="pd-star-sm pd-star-sm--filled">★</span> {parseFloat(rp.product_rating).toFixed(1)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Sticky Add to Cart Bar ─────────────────────────────────── */}
      <div className={`pd-sticky-bar ${showSticky ? 'pd-sticky-bar--visible' : ''}`}>
        <div className="pd-sticky-bar__inner container">
          <img className="pd-sticky-bar__img" src={resolveImage(product.featured_image)} alt="" />
          <div className="pd-sticky-bar__info">
            <span className="pd-sticky-bar__name">{product.product_name}</span>
            <span className="pd-sticky-bar__price">৳{parseFloat(sellingPrice).toLocaleString()}</span>
          </div>
          <div className="pd-sticky-bar__actions">
            <button className="pd-btn pd-btn--cart pd-btn--sm" onClick={handleAddToCart} disabled={stock === 0}>Add to Cart</button>
            <button className="pd-btn pd-btn--buy pd-btn--sm" onClick={() => { handleAddToCart(); navigate('/cart'); }} disabled={stock === 0}>Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
