# Proguard rules for Shopperz Mart
-keepattributes Signature
-keepattributes *Annotation*

# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }

# Moshi
-keep class com.squareup.moshi.** { *; }
-keepclassmembers class ** {
    @com.squareup.moshi.FromJson *;
    @com.squareup.moshi.ToJson *;
}

# Hilt
-dontwarn dagger.hilt.**
-keep class dagger.hilt.** { *; }

# App models
-keep class com.shopperzmart.kotlin.data.remote.dto.** { *; }
-keep class com.shopperzmart.kotlin.domain.model.** { *; }
