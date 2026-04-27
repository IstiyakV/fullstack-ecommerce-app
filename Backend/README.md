# Backend — NestJS REST API

The backend powers all three client applications (Web, Admin, Android) through a unified REST API.

## Tech Stack

- **NestJS** 11 — TypeScript framework
- **TypeORM** — ORM with PostgreSQL
- **JWT** — Authentication (customers + admin)
- **Multer** — Image upload handling
- **bcrypt** — Password hashing

## Architecture

```
src/
├── main.ts                     # Entry point, CORS, static files
├── app.module.ts               # Root module (ConfigModule, TypeORM, all modules)
├── common/                     # Guards, decorators, pipes
├── database/
│   ├── entities/               # 14+ TypeORM entities
│   └── seed/                   # SeedService (auto-seeds on first run)
├── modules/
│   ├── auth/                   # Login, Register, Google Sign-In, JWT
│   ├── product/                # Product details, filtering, reviews
│   ├── order/                  # Order placement, tracking, cancellation
│   ├── home/                   # Homepage feed data
│   ├── category/               # Category listing
│   ├── config/                 # Cities, shipping zones, app config
│   └── admin/                  # 55 admin endpoints (CRUD for everything)
└── utils/                      # Helpers (hashId, etc.)
```

## Database Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Product | products | Catalog with pricing, stock, category |
| ProductSku | product_skus | Variant combinations with per-SKU pricing |
| VariantType | variant_types | Variant dimensions (Color, Size, Storage) |
| VariantOption | variant_options | Option values (Red, Blue, 128GB) |
| Customer | customers | User accounts with Google OAuth support |
| Order | orders | 10-stage delivery pipeline |
| OrderTimeline | order_timeline | Status change history |
| Address | addresses | Customer delivery addresses |
| Category | categories | Product categories |
| Brand | brands | Product brands |
| Slider | sliders | Homepage carousel slides |
| BannerSlider | banner_sliders | Promotional banners |
| Review | reviews | Product reviews with ratings |
| Voucher | vouchers | Discount codes |
| City | cities | 64+ Bangladeshi cities |
| ShippingZone | shipping_zones | Zone-based shipping fees |
| AppConfig | app_config | Dynamic key-value settings |
| PaymentGateway | payment_gateways | Payment method configuration |
| Notification | notifications | Push notification records |

## API Endpoints

### Customer API (`POST /api/v1/*`)

```
Auth:     login, android-registration, google-login, validate-token, profile-update
Product:  product-details, filtered-product, write-review
Address:  save-address, get-address, delete-address
Order:    order-save, get-orders, order-details, cancel-order
Home:     home-data
Category: categories
Config:   config/cities, config/shipping-zones, config/app-config, config/payment-gateways
```

### Admin API (`/api/admin/*`)

```
Auth:     POST login, POST change-password
Dashboard: GET dashboard
CRUD:     products, categories, brands, sliders, banners, vouchers
          shipping-zones, cities, config, payment-gateways
Read-only: customers, reviews
Orders:   GET list, GET detail, PATCH status, PATCH tracking, POST timeline
Upload:   POST upload (multipart/form-data)
Notifications: GET list, POST create, POST broadcast
```

## Seed Data

On first run (empty database), the seed service automatically creates:
- 8 demo products with images
- 4 categories, 3 brands
- 3 homepage sliders, 2 banners
- 64+ Bangladeshi cities in 2 shipping zones
- 2 voucher codes
- 7 app config entries
- 4 payment gateway entries
- 12 demo reviews
- 1 demo customer (01700000000 / 12345678)

## Running Standalone

```bash
cd Backend
cp .env.example .env
npm install
npm run start:dev
```

> Note: Requires a PostgreSQL instance. Use `docker-compose -f ../docker-compose.dev.yml up db -d` to start one.

## Environment

The backend reads configuration from:
1. Root `.env` (primary — `../../.env` from `dist/`)
2. Local `.env` (fallback — `./env`)

Key variables: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `API_PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `CORS_ORIGINS`
