# Admin — React Admin Panel

A premium admin dashboard for managing all aspects of the Shopperz Mart e-commerce platform.

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool
- **Tailwind CSS 4** — Utility-first styling
- **AdminLTE 4** — Admin template (CSS only)
- **Chart.js** + **react-chartjs-2** — Dashboard charts
- **React Router 7** — Client-side routing
- **React Hot Toast** — Notifications
- **React Icons** (Feather) — Icon library

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Revenue chart, order stats, top products, recent orders |
| Login | `/login` | Admin email/password authentication |
| Change Password | `/change-password` | First-login password update |
| Products | `/products` | Full CRUD with category/brand dropdowns + variant management |
| Product Variants | `/products/:id/variants` | SKU matrix, variant types/options, gallery upload |
| Categories | `/categories` | CRUD with image upload |
| Brands | `/brands` | CRUD with image upload |
| Sliders | `/sliders` | Homepage carousel management |
| Banners | `/banners` | Promotional banner management |
| Vouchers | `/vouchers` | Discount code management |
| Customers | `/customers` | Read-only customer list |
| Reviews | `/reviews` | Read-only review list with star ratings |
| Orders | `/orders` | Order list with status filter |
| Order Detail | `/orders/:id` | Full order view + status pipeline + timeline |
| Notifications | `/notifications` | Send/broadcast push notifications |
| Shipping | `/shipping` | Shipping zones + cities dual CRUD |
| Settings | `/settings` | Key-value app configuration editor |
| Payment Gateways | `/payment-gateways` | Gateway toggle and config editor |

## Key Components

### CrudPage

Universal CRUD component that powers most admin pages:
- Paginated or full-list data tables
- Modal forms with 2-column grid layout
- Field types: text, textarea, select, image
- Slide-up animation with glassmorphism overlay
- Delete confirmation dialog

### ImageUpload

Drop-zone style image uploader with:
- Drag-and-drop support
- Preview thumbnails
- Uploads to `/api/admin/upload`

### AdminLayout

Shell component with:
- Dark gradient sidebar with grouped navigation sections
- Glassmorphism navbar with backdrop-filter blur
- Content area with breadcrumbs

## Authentication

- JWT-based admin authentication
- Credentials configured via `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Token stored in `localStorage('admin_token')`
- Automatic 401 redirect to login
- `ProtectedRoute` and `GuestRoute` guards

## Running Standalone

```bash
cd Admin
npm install
npm run dev    # Starts on ADMIN_PORT (default: 3002)
```

> The Vite dev server proxies `/api/` to `http://localhost:3000`.

## Design System

Custom CSS (`index.css`) extending AdminLTE with:
- CSS custom properties for colors, radii, shadows
- Glassmorphism navbar
- Gradient buttons with hover effects
- Premium modal with header/body/footer structure
- Custom scrollbars
- Responsive mobile breakpoints

> **Important:** AdminLTE CSS must be imported via JavaScript (`main.jsx`), NOT via CSS `@import`, to avoid `@charset` conflicts with Tailwind CSS 4.
