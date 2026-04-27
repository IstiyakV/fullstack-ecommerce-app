# Android-Kotlin — Native Android App

A native Android e-commerce app built with modern Android development best practices.

## Tech Stack

- **Kotlin** — Programming language
- **Jetpack Compose** — Declarative UI framework (Material 3)
- **Hilt** — Dependency injection
- **Retrofit** + **Moshi** — Network layer
- **Room** — Local database (wishlist)
- **DataStore** — Preferences (user session)
- **Coil** — Image loading with aggressive caching
- **Coroutines** + **Flow** — Async operations

## Architecture

**MVVM + Clean Architecture** with clear layer separation:

```
app/src/main/java/com/shopperzmart/kotlin/
├── core/
│   ├── network/                # ApiService, NetworkModule, AuthInterceptor
│   └── utils/                  # Constants, Result wrapper
├── data/
│   ├── local/                  # Room DB (WishlistEntity), DataStore (UserPreferences)
│   ├── remote/
│   │   ├── dto/                # Dtos.kt (all DTOs in single file)
│   │   └── mapper/             # Mappers.kt (DTO → Domain)
│   └── repository/             # Repository implementations
├── di/                         # Hilt modules (Repository, Database)
├── domain/
│   ├── model/                  # Domain models (Customer, Product, Order...)
│   ├── repository/             # Repository interfaces
│   └── usecase/                # UseCases.kt (all use cases in single file)
└── ui/
    └── screens/                # 20+ Composable screens
```

## Screens

| Screen | Features |
|--------|----------|
| Splash | Premium animated branding with golden glow |
| Login | Phone/password + Google Sign-In button |
| Register | Name, phone, email, password |
| Home | Sliders, categories, brands (circular), products, flash sale, "Just For You" |
| Product Detail | Zoomable gallery, SKU variants (image cards + pills), tabs, trust panel |
| Product List | Category/price filters, active chips, sort, pagination |
| Search | Live product search |
| Cart | Variant-specific thumbnails, quantity controls, login gate |
| Checkout | 4-step wizard: Address → Shipping → Payment → Review |
| Order History | Status-colored order cards with shimmer loading |
| Order Detail | Gradient status header, collapsible timeline, track button |
| Order Tracking | Horizontal stepper, vertical timeline, courier info |
| Wishlist | Room-backed local wishlist |
| Address List | Saved addresses with default badge |
| Add Address | City dropdown (64+ cities), recipient details |
| Profile | View/edit user information |
| Notifications | Notification list |

## Build Flavors

| Flavor | Application ID | API URL |
|--------|---------------|---------|
| `dev` | `com.shopperzmart.kotlin.dev` | `http://10.0.2.2:3000/` (emulator) |
| `staging` | `com.shopperzmart.kotlin.staging` | `https://staging-api-shopperzmart.com/` |
| `prod` | `com.shopperzmart.kotlin` | `https://api-shopperzmart.com/` |

## Setup

### Prerequisites
- Android Studio (latest stable)
- JDK 17+
- Android SDK 35

### Steps

1. Open `Android-Kotlin/` in Android Studio
2. Create `local.properties`:
   ```properties
   sdk.dir=C\:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
   ```
3. Sync Gradle
4. Select `devDebug` build variant
5. Run on emulator or physical device

### Physical Device Testing

Update the `dev` flavor `BASE_URL` in `app/build.gradle.kts` to your machine's LAN IP:
```kotlin
buildConfigField("String", "BASE_URL", "\"http://YOUR_LAN_IP:3000/\"")
```

## Key Implementation Patterns

- **Single-file DTOs:** All network DTOs in `Dtos.kt` for easy discovery
- **Single-file UseCases:** All use cases in `UseCases.kt`
- **Result wrapper:** `sealed class Result<T>` for consistent error handling
- **AuthInterceptor:** Reads JWT from DataStore via `runBlocking`, attaches Bearer header
- **SKU matching:** O(n) local array matcher for instant variant selection without API calls
- **Image caching:** Coil with 250MB disk cache, 25% heap memory cache, no cache-header respect

## Build

```bash
cd Android-Kotlin
./gradlew assembleDevDebug    # Debug APK
./gradlew assembleProdRelease  # Production APK (requires signing config)
```
