import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import CategoryBar from './CategoryBar';
import Footer from './Footer';

export default function MainLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-layout">
      <Header />
      <CategoryBar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
