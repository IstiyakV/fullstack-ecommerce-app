import { useState, useEffect } from 'react';
import ProductCard from '../common/ProductCard';

export default function FlashSale({ products = [] }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 30, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!products.length) return null;

  const pad = (n) => n.toString().padStart(2, '0');

  return (
    <div className="section">
      <div className="flash-sale">
        <div className="flash-sale__header">
          <h2 className="flash-sale__title">⚡ Flash Sale</h2>
          <div className="flash-sale__timer">
            <span className="flash-sale__time-block">{pad(timeLeft.hours)}</span>
            <span className="flash-sale__separator">:</span>
            <span className="flash-sale__time-block">{pad(timeLeft.minutes)}</span>
            <span className="flash-sale__separator">:</span>
            <span className="flash-sale__time-block">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
        <div className="flash-sale__scroll">
          {products.slice(0, 12).map(p => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
