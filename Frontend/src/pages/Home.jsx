import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import client from '../api/client';
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import FlashSale from '../components/home/FlashSale';
import BannerStrip from '../components/home/BannerStrip';
import ProductSection from '../components/home/ProductSection';
import BrandRow from '../components/home/BrandRow';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.post('/home')
      .then(r => setData(r.data))
      .catch(err => console.error('Home data error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '280px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2>Unable to load store data</h2>
        <p className="text-muted mt-2">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopperz Mart — Online Shopping in Bangladesh</title>
        <meta name="description" content="Shop the best deals on electronics, fashion, home and more at Shopperz Mart. Fast delivery across Bangladesh." />
      </Helmet>

      <div className="container">
        {/* 1. Hero Carousel */}
        <HeroCarousel sliders={data.sliders || []} />

        {/* 2. Category Grid */}
        <CategoryGrid categories={data.top_categories || []} />

        {/* 3. Flash Sale */}
        <FlashSale products={data.hot_deals || []} />

        {/* 4. Banner */}
        <BannerStrip banners={data.full_slider || []} />

        {/* 5. New Arrivals */}
        <ProductSection
          title="New Arrivals"
          products={data.new_arrivals || []}
          link="/products?is_new_arrivals=1"
        />

        {/* 6. Half Banners */}
        <BannerStrip banners={data.half_slider || []} double />

        {/* 7. Popular Products */}
        <ProductSection
          title="Popular Products"
          products={data.popular_products || []}
          link="/products?is_popular=1"
        />

        {/* 8. Brands */}
        <BrandRow brands={data.brands || []} />

        {/* 9. Just For You (reusing products) */}
        <ProductSection
          title="Just For You"
          products={[...(data.new_arrivals || [])].sort(() => 0.5 - Math.random()).slice(0, 10)}
          link="/products"
        />
      </div>
    </>
  );
}
