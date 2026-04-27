import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

export default function CategoryBar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    client.post('/home')
      .then(r => setCategories(r.data.top_categories || []))
      .catch(() => {});
  }, []);

  if (!categories.length) return null;

  return (
    <nav className="category-bar">
      <div className="container">
        {categories.slice(0, 12).map(cat => (
          <Link
            key={cat.parent_category_id}
            to={`/products?category=${cat.parent_category_id}`}
            className="category-bar__item"
          >
            {cat.parent_category_name_en}
          </Link>
        ))}
      </div>
    </nav>
  );
}
