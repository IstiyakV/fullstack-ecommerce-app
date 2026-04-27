# Contributing to Shopperz Mart

Thank you for your interest in contributing to Shopperz Mart! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**
- **Docker** and **Docker Compose**
- **Git**
- **Android Studio** (for Android development only)

### Setup

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Shopperz-Mart.git
   cd Shopperz-Mart
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
4. **Start development environment:**
   ```bash
   # Full Docker mode
   docker-compose up --build -d

   # OR Hybrid mode (recommended for development)
   # Windows:
   .\dev.ps1
   # Linux/macOS:
   ./dev.sh
   ```
5. **Verify** everything is running:
   - Web: http://localhost:3001
   - Admin: http://localhost:3002
   - API: http://localhost:3000

## Development Workflow

1. Create a new branch from `main`
2. Make your changes
3. Test your changes locally
4. Commit with descriptive messages
5. Push to your fork
6. Open a Pull Request

## Branch Naming

Use the following prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/wishlist-sharing` |
| `fix/` | Bug fixes | `fix/cart-quantity-overflow` |
| `docs/` | Documentation | `docs/api-endpoints` |
| `refactor/` | Code refactoring | `refactor/auth-middleware` |
| `style/` | UI/styling changes | `style/checkout-responsive` |
| `test/` | Adding tests | `test/order-service` |

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: CSS/UI changes (no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes

### Examples
```
feat(frontend): add product comparison page
fix(backend): resolve order status update race condition
docs(readme): add Android setup instructions
style(admin): improve dashboard chart responsiveness
```

## Pull Request Process

1. **Update documentation** if your change affects the public API or setup process
2. **Ensure no secrets** are committed (check `.env` files)
3. **Test all affected platforms** (Web, Admin, API, or Android)
4. **Fill out the PR template** completely
5. **Request a review** from a maintainer

### PR Checklist

- [ ] I have tested my changes locally
- [ ] I have updated documentation (if applicable)
- [ ] My code follows the existing code style
- [ ] I have not committed any secrets or credentials
- [ ] I have added/updated comments where necessary

## Project Structure

| Directory | Tech | Description |
|-----------|------|-------------|
| `Backend/` | NestJS, TypeORM, PostgreSQL | REST API with 55+ endpoints |
| `Frontend/` | React 19, Vite 8, Vanilla CSS | Customer-facing web storefront |
| `Admin/` | React 19, Tailwind CSS 4, AdminLTE | Admin dashboard and management |
| `Android-Kotlin/` | Kotlin, Jetpack Compose, Hilt | Native Android application |

## Need Help?

- Open an [Issue](https://github.com/IstiyakV/Shopperz-Mart/issues) for bugs or feature requests
- Check existing issues before creating a new one
- Use issue templates for structured reporting

Thank you for contributing! 🎉
