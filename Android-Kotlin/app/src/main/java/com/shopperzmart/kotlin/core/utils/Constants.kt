package com.shopperzmart.kotlin.core.utils

import com.shopperzmart.kotlin.BuildConfig

object Constants {
    const val BASE_URL = BuildConfig.BASE_URL
    const val PREF_KEY_AUTH_TOKEN = "auth_token"
    const val PREF_KEY_USER_JSON  = "user_json"
    const val PREF_KEY_IS_LOGGED_IN = "is_logged_in"

    const val DB_NAME = "shopperz_mart_db"

    // Timeouts
    const val NETWORK_TIMEOUT = 30L

    // Google Sign-In — fill from Firebase Console
    const val GOOGLE_WEB_CLIENT_ID = ""

    /**
     * Resolves image URLs — if the URL is a relative path (starts with /),
     * prepends the BASE_URL origin so Coil can load it.
     * Absolute URLs (http/https) are returned unchanged.
     */
    fun resolveImageUrl(url: String?): String? {
        if (url.isNullOrBlank()) return null
        if (url.startsWith("http://") || url.startsWith("https://")) return url
        // BASE_URL ends with "/" and relative paths start with "/"
        val origin = BASE_URL.trimEnd('/')
        return "$origin$url"
    }
}
