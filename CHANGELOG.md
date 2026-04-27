# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-04-27

### 🎉 Initial Release

The first public release of Shopperz Mart — a complete, production-ready e-commerce platform.

### Added

#### Backend (NestJS)
- REST API with 55+ endpoints (Customer + Admin)
- 14+ database entities with TypeORM
- JWT authentication + Google Sign-In support
- Stripe payment integration (mock mode with production-ready code)
- 10-stage order delivery pipeline with timeline tracking
- Seed data: 8 products, 64+ cities, 2 shipping zones, vouchers
- Admin panel authentication with JWT
- Image upload with Multer
- CORS configuration for multi-domain deployment

#### Web Frontend (React)
- 9 pages: Home, Product List, Product Detail, Cart, Checkout, Order Success, Login, Register, Account
- Daraz-inspired design system (2100+ lines vanilla CSS)
- Hero carousel with admin-managed banners
- SKU variant system with color/size selectors
- Flash sale countdown timer
- Multi-step checkout wizard (Address → Shipping → Payment → Review)
- User account management (Profile, Addresses, Order History)
- Wishlist with localStorage persistence
- SEO optimization with React Helmet

#### Admin Panel (React)
- 16 admin pages with full CRUD operations
- Dashboard with revenue charts and order statistics
- Product management with variant matrix and image upload
- Order management with 10-stage pipeline and custom timeline
- Shipping zone and city management
- Customer, review, voucher, notification management
- Premium glassmorphism design system

#### Android App (Kotlin + Jetpack Compose)
- 20+ screens with Material 3 design
- Full-screen zoomable product image gallery
- SKU variant selectors (image cards + text pills)
- 4-step checkout with 64+ BD cities
- Order tracking with Daraz-inspired timeline
- Shimmer loading skeletons on all data views
- Room database-backed offline wishlist
- Build flavors: dev, staging, prod

#### DevOps
- Docker Compose (4 containers: PostgreSQL + API + Web + Admin)
- Hybrid dev scripts (dev.ps1, dev.sh, dev.bat)
- Production deployment script (deploy.ps1)
- Centralized port configuration via root .env
- Nginx configs for SPA routing and API proxying
