import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiChevronDown, FiGrid, FiList, FiX } from 'react-icons/fi';
import client from '../api/client';
import ProductCard from '../components/common/ProductCard';

const SORT_OPTIONS = [
  { value: '', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

const PER_PAGE = 20;

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const priceMin = searchParams.get('price_min') || '';
  const priceMax = searchParams.get('price_max') || '';

  // Load categories for filter sidebar
  useEffect(() => {
    client.post('/home')
      .then(r => setCategories(r.data.top_categories || []))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    const body = {
      search_query: search,
      product_category_id: category,
      sort_by: sort,
      page,
      per_page: PER_PAGE,
    };
    if (priceMin) body.price_min = priceMin;
    if (priceMax) body.price_max = priceMax;

    client.post('/filtered-product', body)
      .then(r => {
        setProducts(r.data.data || r.data.products || []);
        setTotalCount(r.data.total_count || r.data.data?.length || 0);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, sort, page, priceMin, priceMax]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const clearAllFilters = () => setSearchParams({});

  const hasActiveFilters = search || category || priceMin || priceMax;

  // Page title
  const pageTitle = search
    ? `Search: "${search}"`
    : category
      ? categories.find(c => String(c.parent_category_id) === category)?.parent_category_name_en || 'Products'
      : 'All Products';

  return (
    <>
      <Helmet>
        <title>{pageTitle} — Shopperz Mart</title>
      </Helmet>

      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">{pageTitle}</span>
        </div>

        <div className="product-list-layout">
          {/* Mobile filter toggle */}
          <button className="filter-mobile-toggle btn btn-ghost" onClick={() => setMobileFilterOpen(true)}>
            <FiChevronDown size={16} /> Filters
          </button>

          {/* Sidebar */}
          <aside className={`filter-sidebar ${mobileFilterOpen ? 'filter-sidebar--open' : ''}`}>
            <div className="filter-sidebar__header">
              <h3>Filters</h3>
              <button className="filter-sidebar__close" onClick={() => setMobileFilterOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Category filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Category</h4>
              <div className="filter-group__list">
                <label className="filter-radio">
                  <input type="radio" name="cat" checked={!category} onChange={() => updateFilter('category', '')} />
                  <span>All Categories</span>
                </label>
                {categories.map(c => (
                  <label key={c.parent_category_id} className="filter-radio">
                    <input
                      type="radio"
                      name="cat"
                      checked={String(c.parent_category_id) === category}
                      onChange={() => updateFilter('category', String(c.parent_category_id))}
                    />
                    <span>{c.parent_category_name_en}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Price Range</h4>
              <div className="filter-price-inputs">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  value={priceMin}
                  onChange={e => updateFilter('price_min', e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  value={priceMax}
                  onChange={e => updateFilter('price_max', e.target.value)}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm btn-block mt-4" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Backdrop for mobile */}
          {mobileFilterOpen && <div className="filter-backdrop" onClick={() => setMobileFilterOpen(false)} />}

          {/* Main content */}
          <div className="product-list-main">
            {/* Sort bar */}
            <div className="sort-bar">
              <span className="sort-bar__count">
                {totalCount} product{totalCount !== 1 ? 's' : ''} found
              </span>
              <div className="sort-bar__right">
                <span className="text-sm text-muted">Sort by:</span>
                <select className="sort-bar__select" value={sort} onChange={e => updateFilter('sort', e.target.value)}>
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="product-grid">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '320px' }} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map(p => (
                  <ProductCard key={p.product_id} product={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>No products found</h3>
                <p className="text-muted">Try adjusting your filters or search term.</p>
                <button className="btn btn-primary mt-4" onClick={clearAllFilters}>Clear Filters</button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination__btn"
                  disabled={page === 1}
                  onClick={() => updateFilter('page', String(page - 1))}
                >
                  ← Prev
                </button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      className={`pagination__btn ${p === page ? 'active' : ''}`}
                      onClick={() => updateFilter('page', String(p))}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="pagination__btn"
                  disabled={page === totalPages}
                  onClick={() => updateFilter('page', String(page + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
