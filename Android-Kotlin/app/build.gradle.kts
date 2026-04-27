plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.shopperzmart.kotlin"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.shopperzmart.kotlin"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // ── Build Flavors ───────────────────────────────────────────────────
    flavorDimensions += "environment"
    productFlavors {
        create("dev") {
            dimension = "environment"
            applicationIdSuffix = ".dev"
            versionNameSuffix = "-dev"
            buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:3000/\"")
            buildConfigField("String", "ENV_NAME", "\"Development\"")
            resValue("string", "app_name", "Shopperz Dev")
        }
        create("staging") {
            dimension = "environment"
            applicationIdSuffix = ".staging"
            versionNameSuffix = "-staging"
            buildConfigField("String", "BASE_URL", "\"https://staging-api-shopperzmart.com/\"")
            buildConfigField("String", "ENV_NAME", "\"Staging\"")
            resValue("string", "app_name", "Shopperz Staging")
        }
        create("prod") {
            dimension = "environment"
            buildConfigField("String", "BASE_URL", "\"https://api-shopperzmart.com/\"")
            buildConfigField("String", "ENV_NAME", "\"Production\"")
            resValue("string", "app_name", "Shopperz Mart")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

// Tell Moshi KSP code-gen to suppress the deprecated-kapt nag
ksp {
    arg("moshi.generateProguardRules", "false")
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Compose BOM — provides ui, material3, foundation (includes HorizontalPager natively)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons)

    // Navigation
    implementation(libs.androidx.navigation.compose)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)

    // Room
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // DataStore
    implementation(libs.datastore.preferences)

    // Retrofit + OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.moshi)
    implementation(platform(libs.okhttp.bom))
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)

    // Moshi
    implementation(libs.moshi.kotlin)
    ksp(libs.moshi.codegen)

    // Coil (Kotlin-native, Compose-ready image loader)
    implementation(libs.coil.compose)

    // Coroutines
    implementation(libs.coroutines.android)

    // WorkManager
    implementation(libs.workmanager)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.junit.ext)
    androidTestImplementation(libs.espresso)
    debugImplementation(libs.androidx.ui.tooling)
}
