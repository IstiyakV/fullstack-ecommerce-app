import { useState, useEffect, useRef, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1/customer', '') || '';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function HeroCarousel({ sliders = [] }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const len = sliders.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + len) % len), [len]);

  // Auto-play
  useEffect(() => {
    if (len <= 1) return;
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [len, next]);

  // Pause on hover
  const pause = () => clearInterval(intervalRef.current);
  const resume = () => {
    if (len <= 1) return;
    intervalRef.current = setInterval(next, 5000);
  };

  if (!len) {
    return (
      <div className="hero-carousel" style={{ background: 'linear-gradient(135deg, #FF6B35, #E85A27)', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '8px' }}>Welcome to Shopperz Mart</h2>
          <p style={{ opacity: 0.9, fontSize: '1.125rem' }}>Best deals, lowest prices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel" onMouseEnter={pause} onMouseLeave={resume}>
      {sliders.map((s, i) => (
        <div key={s.slider_id || i} className={`hero-carousel__slide ${i === current ? 'active' : ''}`}>
          <img
            className="hero-carousel__image"
            src={resolveImage(s.slider_image || s.image)}
            alt={s.slider_title || `Promotion ${i + 1}`}
          />
        </div>
      ))}

      {len > 1 && (
        <>
          <button className="hero-carousel__arrow hero-carousel__arrow--left" onClick={prev} aria-label="Previous slide">
            <FiChevronLeft size={18} />
          </button>
          <button className="hero-carousel__arrow hero-carousel__arrow--right" onClick={next} aria-label="Next slide">
            <FiChevronRight size={18} />
          </button>
          <div className="hero-carousel__dots">
            {sliders.map((_, i) => (
              <button
                key={i}
                className={`hero-carousel__dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
