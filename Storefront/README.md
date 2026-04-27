# Storefront — React Web Storefront

A Daraz/Amazon-inspired e-commerce storefront built with React 19 and vanilla CSS.

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool with hot-reload
- **React Router 7** — Client-side routing
- **Axios** — HTTP client
- **React Helmet Async** — SEO meta tags
- **React Hot Toast** — Notifications
- **React Icons** (Feather) — Icon library
- **Vanilla CSS** — 2100+ line custom design system (no Tailwind)

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero carousel, category grid, flash sale, banners, product sections, brand row |
| Product Listing | `/products` | Sidebar filters (category, price range), sort dropdown, pagination |
| Product Detail | `/product/:slug` | Image gallery, SKU variants, quantity selector, tabs (Description / Specs / Reviews) |
| Cart | `/cart` | Item list with quantity controls, order summary |
| Checkout | `/checkout` | 3-step wizard: Address → Shipping/Payment → Review |
| Order Success | `/order-success` | Animated confirmation with order ID |
| Login | `/login` | Phone + password authentication |
| Register | `/register` | Account creation form |
| My Account | `/account/*` | Profile, Addresses, Order History |
| Wishlist | `/wishlist` | Saved products with localStorage persistence |

## Architecture

```
src/
├── api/
│   └── client.js               # Axios instance (baseURL: /api/v1/customer)
├── components/
│   ├── layout/                  # Header (3-row), CategoryBar, Footer, MainLayout
│   ├── home/                    # HeroCarousel, FlashSale, CategoryGrid, ProductSection
│   └── common/                  # ProductCard (with wishlist heart)
├── context/
│   ├── AuthContext.jsx          # Token auth, login/register/logout
│   ├── CartContext.jsx          # localStorage-backed cart state
│   └── WishlistContext.jsx      # localStorage-backed wishlist
├── pages/                       # All page components
├── utils/
│   └── hashId.js                # SEO-friendly URL encoding/decoding
├── index.css                    # Complete design system (2100+ lines)
└── App.jsx                      # Route definitions
```

## Design System

The CSS design system is built entirely with vanilla CSS custom properties:

- **Brand color:** `--sm-primary: #FF6B35`
- **Typography:** Outfit (Google Fonts)
- **Layout:** 1200px centered container
- **Components:** Cards, buttons, badges, form inputs, modals
- **Responsive:** Full mobile support with `@media (max-width: 768px)` breakpoints
- **No Tailwind** — intentionally uses vanilla CSS for maximum control

## Running Standalone

```bash
cd Storefront
npm install
npm run dev    # Starts on WEB_PORT (default: 3001)
```

> The Vite dev server proxies `/api/v1` to `http://localhost:3000` (configurable via root `.env`).

## Production Build

```bash
npm run build   # Outputs to dist/
```

Served via Nginx in Docker or any static file host. See `nginx.conf` for SPA routing and API proxy configuration.
