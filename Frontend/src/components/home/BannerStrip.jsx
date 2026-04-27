const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function BannerStrip({ banners = [], double = false }) {
  if (!banners.length) return null;

  const items = double ? banners.slice(0, 2) : banners.slice(0, 1);

  return (
    <div className={`banner-strip ${double ? 'banner-strip--double' : ''}`}>
      {items.map((b, i) => (
        <img
          key={b.promotional_slider_id || i}
          src={resolveImage(b.slider_image)}
          alt={b.slider_title || `Promotion ${i + 1}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}
