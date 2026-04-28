<p align="center">
  <img src="docs/banner.png" alt="Shopperz Mart Banner" width="100%" />
</p>

<h1 align="center">🛒 Shopperz Mart</h1>

<p align="center">
  <strong>A production-ready, full-stack e-commerce platform with Android app, React storefront, Admin panel, and NestJS API — all in one monorepo.</strong>
</p>

<p align="center">
  <samp>🛍️ Web Storefront · 📱 Android App · ⚙️ Admin Panel · 🔌 REST API · 🐳 One-Command Docker</samp>
</p>

<p align="center">
  <a href="https://github.com/IstiyakV/fullstack-ecommerce-app/stargazers"><img src="https://img.shields.io/github/stars/IstiyakV/fullstack-ecommerce-app?style=for-the-badge&logo=github&color=f59e0b" alt="Stars" /></a>
  <a href="https://github.com/IstiyakV/fullstack-ecommerce-app/network/members"><img src="https://img.shields.io/github/forks/IstiyakV/fullstack-ecommerce-app?style=for-the-badge&logo=git&color=3b82f6" alt="Forks" /></a>
  <a href="https://github.com/IstiyakV/fullstack-ecommerce-app/issues"><img src="https://img.shields.io/github/issues/IstiyakV/fullstack-ecommerce-app?style=for-the-badge&logo=github&color=ef4444" alt="Issues" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/IstiyakV/fullstack-ecommerce-app?style=for-the-badge&color=22c55e" alt="License" /></a>
</p>

<p align="center">
  <a href="#-what-is-shopperz-mart">About</a> •
  <a href="#-app-preview">Preview</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="CONTRIBUTING.md">Contributing</a><br/>
  <a href="#-license">License</a> •
  <a href="#-support-the-developer">Support</a> •
  <a href="#-author">Author</a>
</p>

---

## 🎯 What is Shopperz Mart?

> [!NOTE]  
> ⭐ **If you find this project useful, please consider giving it a star on GitHub!** It helps the project grow and reach more developers.

Shopperz Mart is a **complete, production-grade e-commerce ecosystem** built from the ground up. It's not a tutorial project — it's a fully deployable platform with real-world features like multi-variant SKU management, Stripe-ready checkout, order tracking, and a native Android app.

**Built for developers who want to:**
- 🏗️ Study a real full-stack architecture (not a TODO app)
- 🚀 Fork and customize for their own e-commerce business
- 📱 See how web and mobile apps share the same API
- 🐳 Deploy anywhere with Docker in under 5 minutes

---

## 📸 App Preview

<table>
  <tr>
    <td width="30%" valign="top" align="center">
      <b>📱 Native Android App</b><br/><br/>
      <img src="docs/screenshots/mobile-app/mobile-1.png" alt="Android App Homepage" /><br/><br/>
      <img src="docs/screenshots/mobile-app/mobile-4.png" alt="Android App Order Details" />
    </td>
    <td width="70%" valign="top" align="center">
      <b>🌐 React Web Storefront</b><br/><br/>
      <img src="docs/screenshots/storefront/storefront-1.png" alt="Web Storefront Homepage" /><br/><br/>
      <b>⚙️ React Admin Panel</b><br/><br/>
      <img src="docs/screenshots/admin/admin-1-.png" alt="Admin Dashboard" />
    </td>
  </tr>
</table>

<p align="center">
  <em>👇 See all 30 screenshots in the <a href="#-screenshots">full gallery</a> below</em>
</p>

---

## ⚡ Installation & Setup

### Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) | Latest | Option 1 & 2 (Docker/Hybrid) |
| [**Node.js**](https://nodejs.org/en/download/) | 20+ | Option 2 & 3 (Hybrid/Manual) |
| [**PostgreSQL**](https://www.postgresql.org/download/) | 14+ | Option 3 (Manual Setup) |
| [**Android Studio**](https://developer.android.com/studio) | Latest | Android app only |
| [**Git**](https://git-scm.com/downloads) | Any | Cloning the repo |

<details open>
<summary><b>🐳 Option 1: Docker (Recommended — Zero Setup)</b></summary>
<br/>

Get everything running in **under 60 seconds**:

```bash
# 1. Clone the repository
git clone https://github.com/IstiyakV/fullstack-ecommerce-app.git
cd fullstack-ecommerce-app

# 2. Copy and configure environment variables
cp .env.example .env     # (For Windows CMD use: copy .env.example .env)
# Open .env in your editor and set your own secure passwords & JWT secret

# 3. Start all services (PostgreSQL + API + Storefront + Admin)
docker-compose up --build -d

# 4. Wait ~30 seconds for the database to seed, then open:
#    🌐 Web Storefront:  http://localhost:3001
#    ⚙️ Admin Panel:     http://localhost:3002
#    🔌 API Server:      http://localhost:3000
```

> **Admin login:** `admin@shopperzmart.com` / `admin123`

```bash
# Useful Docker commands:
docker-compose logs -f api          # Watch API logs
docker-compose down                 # Stop all containers
docker-compose down -v              # Stop + wipe database (fresh start)
```

> [!WARNING]
> **Database password mismatch?** If you see `password authentication failed` in the API logs, it means the PostgreSQL Docker volume was created with a different password. PostgreSQL only sets the password on the **first** run. Fix it with:
> ```bash
> docker-compose down -v    # Removes the old volume
> docker-compose up --build -d   # Recreates with current .env password
> ```

</details>

<details>
<summary><b>🔥 Option 2: Hybrid Dev Mode (Hot-Reload)</b></summary>
<br/>

Best for active development — runs only PostgreSQL in Docker (~50MB RAM), everything else locally with instant hot-reload:

```bash
# 1. Clone the repository
git clone https://github.com/IstiyakV/fullstack-ecommerce-app.git
cd fullstack-ecommerce-app

# 2. Copy and configure environment variables
cp .env.example .env     # (For Windows CMD use: copy .env.example .env)
# Open .env in your editor and set your own secure passwords & JWT secret

# 2. Install dependencies for each app
cd Backend && npm install && cd ..
cd Storefront && npm install && cd ..
cd Admin && npm install && cd ..

# 3. Start everything with one command
# Windows (PowerShell):
.\dev.ps1
# Linux / macOS:
chmod +x dev.sh && ./dev.sh
```

The script will:
- 🐘 Start PostgreSQL in Docker (port 5433)
- 🔧 Launch NestJS API with hot-reload (port 3000)
- 🌐 Launch React Storefront with HMR (port 3001)
- ⚙️ Launch React Admin with HMR (port 3002)

```bash
# Handy flags:
.\dev.ps1 -BackendOnly         # Only DB + API (skip frontends)
.\dev.ps1 -StorefrontOnly      # Only Storefront (assumes API is running)
.\dev.ps1 -SkipDb              # Skip Docker DB (use existing database)
```

</details>

<details>
<summary><b>🖥️ Option 3: Manual Setup (No Docker)</b></summary>
<br/>

If you have PostgreSQL installed locally:

```bash
# 1. Clone and configure
git clone https://github.com/IstiyakV/fullstack-ecommerce-app.git
cd fullstack-ecommerce-app
cp .env.example .env

# 2. Edit .env — set DATABASE_HOST=localhost and your DB credentials

# 3. Start the API (auto-creates tables + seeds data on first run)
cd Backend
npm install
npm run start:dev

# 4. In a new terminal — start the Storefront
cd Storefront
npm install
npm run dev

# 5. In another terminal — start the Admin Panel
cd Admin
npm install
npm run dev
```

> **Note:** The database tables and seed data (products, categories, demo user) are created automatically on first API startup via TypeORM `synchronize: true`.

</details>

---

## ✨ Features

### 🌐 Web Storefront (React)
| Feature | Description |
|:--------|:------------|
| **Hero Carousel** | Auto-playing banner slider with admin-managed content |
| **Product Catalog** | Category filters, price range, sort options, pagination |
| **SKU Variant System** | Amazon-style color/size selectors with per-variant pricing |
| **Flash Sales** | Countdown timer with discounted products |
| **Shopping Cart** | Persistent cart with quantity management |
| **Multi-Step Checkout** | Address → Shipping → Payment → Review wizard |
| **Order Tracking** | 10-stage delivery pipeline with visual timeline |
| **User Accounts** | Profile, addresses, order history, wishlists |
| **SEO Optimized** | Dynamic meta tags, semantic HTML, SEO-friendly URLs |

### 📱 Android App (Kotlin + Jetpack Compose)
| Feature | Description |
|:--------|:------------|
| **Material 3 Design** | Modern, premium UI with Jetpack Compose |
| **Full-Screen Gallery** | Pinch-to-zoom product images with page indicators |
| **Variant Selectors** | Image cards for colors, pills for sizes — live price/stock updates |
| **Smart Cart** | Variant-specific thumbnails, stock guards, animated toast |
| **4-Step Checkout** | Address with 64+ BD cities, shipping zones, order notes |
| **Order Management** | Daraz-inspired tracking with horizontal stepper |
| **Shimmer Loading** | Professional skeleton screens on all data-loading views |
| **Offline Wishlist** | Room database-backed local wishlist |

### 🔧 Admin Panel (React)
| Feature | Description |
|:--------|:------------|
| **Dashboard** | Revenue charts, order stats, top products, recent orders |
| **Product Management** | Full CRUD with image upload and variant matrix |
| **SKU Matrix** | Auto-generated Cartesian combinations with per-SKU pricing |
| **Order Pipeline** | 10-stage status updates with custom timeline entries |
| **Shipping Zones** | Zone-based fee calculation (Dhaka/Outside Dhaka) |
| **16 Admin Pages** | Products, Categories, Brands, Sliders, Banners, Vouchers, Reviews, Customers, Notifications, Shipping, Settings, Payment Gateways |

### 🔌 Backend API (NestJS)
| Feature | Description |
|:--------|:------------|
| **55+ Endpoints** | REST API covering all customer and admin operations |
| **14+ Entities** | Products, Orders, Customers, Variants, Reviews, Cities, Zones... |
| **Auth System** | JWT + Google Sign-In ready (with token validation) |
| **Stripe Integration** | Payment intent creation (mock mode — production-ready code included) |
| **Image Management** | Multer upload with order-asset preservation |
| **Seed Data** | 8 products, 64+ cities, shipping zones, vouchers — works out of the box |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

**Backend**

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=flat-square&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

</td>
<td align="center" width="25%">

**Web Storefront**

![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router 7](https://img.shields.io/badge/Router_7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![CSS3](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=flat-square&logo=css3&logoColor=white)

</td>
<td align="center" width="25%">

**Android**

![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white)
![Jetpack Compose](https://img.shields.io/badge/Compose-4285F4?style=flat-square&logo=jetpackcompose&logoColor=white)
![Hilt](https://img.shields.io/badge/Hilt-3DDC84?style=flat-square&logo=android&logoColor=white)
![Room](https://img.shields.io/badge/Room_DB-003B57?style=flat-square&logo=sqlite&logoColor=white)

</td>
<td align="center" width="25%">

**DevOps**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI/CD-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![cPanel](https://img.shields.io/badge/cPanel-FF6C2C?style=flat-square&logo=cpanel&logoColor=white)

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB["🌐 React Web<br/>Port 3001"]
        ADMIN["⚙️ React Admin<br/>Port 3002"]
        ANDROID["📱 Android App<br/>Jetpack Compose"]
    end

    subgraph Server["Server Layer"]
        API["🔧 NestJS API<br/>Port 3000"]
    end

    subgraph Data["Data Layer"]
        DB[("🐘 PostgreSQL<br/>14+ Entities")]
        FS["📁 File Storage<br/>Product Images"]
    end

    WEB -->|REST API| API
    ADMIN -->|Admin API + JWT| API
    ANDROID -->|REST API| API
    API --> DB
    API --> FS

    style Client fill:#1e293b,stroke:#f59e0b,color:#fff
    style Server fill:#1e293b,stroke:#22c55e,color:#fff
    style Data fill:#1e293b,stroke:#3b82f6,color:#fff
```

---

## 📁 Project Structure

```
Shopperz-Mart/
├── Backend/                    # NestJS API Server
│   ├── src/
│   │   ├── modules/            # auth, product, order, admin, home, config
│   │   ├── database/           # TypeORM entities + seed data
│   │   └── main.ts             # Entry point
│   ├── public/images/          # Seed product/banner/category images
│   └── Dockerfile
│
├── Storefront/                 # React Web Storefront
│   ├── src/
│   │   ├── components/         # Header, Footer, ProductCard, HeroCarousel...
│   │   ├── pages/              # Home, ProductList, ProductDetail, Cart, Checkout
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   └── index.css           # 2100+ line Daraz-inspired design system
│   ├── nginx.conf
│   └── Dockerfile
│
├── Admin/                      # React Admin Panel
│   ├── src/
│   │   ├── components/         # CrudPage, ImageUpload, AdminLayout
│   │   ├── pages/              # Dashboard, Products, Orders, Shipping...
│   │   └── index.css           # Premium glassmorphism design system
│   ├── nginx.conf
│   └── Dockerfile
│
├── Android-Kotlin/             # Native Android App
│   └── app/src/main/java/
│       ├── core/               # Network, DI, Utils
│       ├── data/               # DTOs, Mappers, Repositories
│       ├── domain/             # Models, UseCases
│       └── ui/                 # Compose Screens (20+)
│
├── docker-compose.yml          # Full production stack (4 containers)
├── docker-compose.dev.yml      # Hybrid dev mode (DB in Docker only)
├── dev.ps1 / dev.sh / dev.bat  # One-command dev environment
├── deploy.ps1                  # Production deployment builder
└── .env.example                # Environment configuration template
```

---

## 📸 Screenshots

<details>
<summary><b>🌐 Web Storefront</b> — 7 screenshots (click to expand)</summary>
<br/>

| | | |
|:---:|:---:|:---:|
| ![Homepage](docs/screenshots/storefront/storefront-1.png) | ![Categories](docs/screenshots/storefront/storefront-2.png) | ![Products](docs/screenshots/storefront/storefront-3.png) |
| **Homepage** | **Category Browse** | **Product Listing** |
| ![Product Detail](docs/screenshots/storefront/storefront-4.png) | ![Cart](docs/screenshots/storefront/storefront-5.png) | ![Checkout](docs/screenshots/storefront/storefront-6.png) |
| **Product Detail** | **Shopping Cart** | **Checkout Flow** |
| ![Order](docs/screenshots/storefront/storefront-7.png) | | |
| **Order Tracking** | | |

</details>

<details>
<summary><b>📱 Android App</b> — 9 screenshots (click to expand)</summary>
<br/>

| | | |
|:---:|:---:|:---:|
| ![Home](docs/screenshots/mobile-app/mobile-1.png) | ![Product](docs/screenshots/mobile-app/mobile-2.png) | ![Cart](docs/screenshots/mobile-app/mobile-3.png) |
| **Home Feed** | **Product Detail** | **Shopping Cart** |
| ![Orders](docs/screenshots/mobile-app/mobile-4.png) | ![Account](docs/screenshots/mobile-app/mobile-5.png) | ![Wishlist](docs/screenshots/mobile-app/mobile-6.png) |
| **Order Tracking** | **My Account** | **Wishlist** |
| ![Checkout](docs/screenshots/mobile-app/mobile-7.png) | ![Categories](docs/screenshots/mobile-app/mobile-8.png) | ![Search](docs/screenshots/mobile-app/mobile-9.png) |
| **Checkout Flow** | **Categories** | **Search** |

</details>

<details>
<summary><b>⚙️ Admin Panel</b> — 14 screenshots (click to expand)</summary>
<br/>

| | | |
|:---:|:---:|:---:|
| ![Dashboard](docs/screenshots/admin/admin-1-.png) | ![Orders](docs/screenshots/admin/admin-2-.png) | ![Order Detail](docs/screenshots/admin/admin-3-.png) |
| **Dashboard** | **Order List** | **Order Detail** |
| ![Products](docs/screenshots/admin/admin-4-.png) | ![Product Edit](docs/screenshots/admin/admin-5-.png) | ![Variants](docs/screenshots/admin/admin-6-.png) |
| **Product List** | **Product Editor** | **Variant Matrix** |
| ![Categories](docs/screenshots/admin/admin-7-.png) | ![Brands](docs/screenshots/admin/admin-8-.png) | ![Customers](docs/screenshots/admin/admin-9-.png) |
| **Categories** | **Brands** | **Customers** |
| ![Sliders](docs/screenshots/admin/admin-10-.png) | ![Banners](docs/screenshots/admin/admin-11-.png) | ![Reviews](docs/screenshots/admin/admin-12-.png) |
| **Sliders** | **Banners** | **Reviews** |
| ![Shipping](docs/screenshots/admin/admin-13-.png) | ![Settings](docs/screenshots/admin/admin-14-.png) | |
| **Shipping Zones** | **App Config** | |

</details>

---

## 🚀 Deployment & Configuration

<details>
<summary><b>🐳 Docker on VPS (DigitalOcean, AWS, etc.)</b></summary>
<br/>

```bash
# 1. Clone on your server
git clone https://github.com/IstiyakV/fullstack-ecommerce-app.git
cd fullstack-ecommerce-app

# 2. Configure production environment
cp .env.example .env
nano .env   # Set real DB credentials, strong admin password, JWT secret

# 3. Build and launch
docker-compose up --build -d

# 4. Verify
curl http://localhost:3000/api/v1/health    # API health check
```

> Set up a reverse proxy (Nginx/Caddy) to point your domain to ports 3001 (web), 3002 (admin), and 3000 (API).

</details>

<details>
<summary><b>📦 Shared Hosting (cPanel / Namecheap)</b></summary>
<br/>

The included `deploy.ps1` script builds all 3 apps into a single ZIP ready for upload:

```powershell
# Build with your domain names
.\deploy.ps1 -ApiDomain "https://api.yourdomain.com" `
             -WebDomain "https://yourdomain.com" `
             -AdminDomain "https://admin.yourdomain.com"

# Output: deploy/yourdomain.com.zip
# Upload → Extract on server → Configure .env → Restart Node.js app
```

| Flag | Effect |
|------|--------|
| `-SkipImages` | Exclude seed images (~600KB instead of ~19MB) |
| `-ApiDomain` | API subdomain (baked into frontend builds) |
| `-WebDomain` | Main storefront domain |
| `-AdminDomain` | Admin panel subdomain |

See module-specific READMEs for detailed setup: [Backend](Backend/README.md) · [Storefront](Storefront/README.md) · [Admin](Admin/README.md)

</details>

<details>
<summary><b>📱 Android Setup</b></summary>
<br/>

1. Open `Android-Kotlin/` in Android Studio
2. Create `local.properties` with your SDK path:
   ```properties
   sdk.dir=C\:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
   ```
3. Update `BASE_URL` in `app/build.gradle.kts` (dev flavor) to your API server
4. Build and run the `devDebug` variant

> **Emulator tip:** The dev flavor uses `http://10.0.2.2:3000/` which maps to your host's localhost via Android emulator.

</details>

<details>
<summary><b>⚙️ Environment Variables</b></summary>
<br/>

Shopperz Mart uses a **Single Source of Truth** for configuration. Instead of managing separate `.env` files in `Backend/`, `Storefront/`, and `Admin/`, you only need **one `.env` file at the root** of the repository.

This single file automatically configures:
- Docker networking (`docker-compose.yml`)
- NestJS API backend (`ConfigModule`)
- React Vite builds (`loadEnv`)
- PowerShell & Bash deployment scripts

#### Setup Instructions

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in your editor and configure the values:

```env
# === Database ===
# Set to 'db' if running inside Docker.
# Set to 'localhost' if running backend locally via npm run start:dev
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=ecommerce

# === Server Ports ===
# These dictate where the apps will run. The dev scripts read these!
API_PORT=3000                       # NestJS API
WEB_PORT=3001                       # React Web Storefront
ADMIN_PORT=3002                     # React Admin Panel
DEV_DB_PORT=5433                    # Host port for DB in hybrid dev mode

# === Admin Panel Authentication ===
ADMIN_EMAIL=admin@shopperzmart.com
ADMIN_PASSWORD=change_this_password
ADMIN_JWT_SECRET=generate_a_random_secret_here

# === Production CORS ===
# Uncomment and set this in production to secure your API
# CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

> ⚠️ **Important:** Never commit your actual `.env` file to GitHub. It is already included in `.gitignore`.

</details>

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Branch naming conventions
- Commit message format
- Pull request process

```bash
# Fork → Clone → Branch → Code → PR
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use this project for personal or commercial purposes.

---

## ⭐ Show Your Support

If this project helped you learn something new or saved you development time, please consider giving it a **star**! It motivates us to keep building and maintaining this project.

<p align="center">
  <a href="https://github.com/IstiyakV/fullstack-ecommerce-app/stargazers">
    <img src="https://img.shields.io/github/stars/IstiyakV/fullstack-ecommerce-app?style=for-the-badge&logo=github&label=Star%20this%20repo&color=f59e0b" alt="Star this repo" />
  </a>
</p>

---

## ☕ Support the Developer

Building and maintaining a production-ready ecosystem takes hundreds of hours. If you'd like to support my work and help fuel the development of **upcoming AI and intelligent features**, consider buying me a coffee! Your support makes a huge difference.

<p align="center">
  <a href="https://buymeacoffee.com/kazimihossain" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</p>

<p align="center">
  <em>Or scan the QR Code below:</em><br/>
  <img src="docs/bmc_qr.png" alt="Buy Me A Coffee QR Code" width="150" />
</p>

---

## 👤 Author

<p align="center">
  <a href="https://isty.me"><strong>Istiyak</strong></a><br/>
  Full-Stack Developer
</p>

<p align="center">
  <a href="https://isty.me"><img src="https://img.shields.io/badge/Portfolio-isty.me-FF6B35?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio" /></a>
  <a href="mailto:contact@isty.me"><img src="https://img.shields.io/badge/Email-contact@isty.me-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
  <a href="https://github.com/IstiyakV"><img src="https://img.shields.io/badge/GitHub-IstiyakV-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
</p>

<p align="center">
  Made with ❤️ by <a href="https://isty.me">Istiyak</a>
</p>
