package com.shopperzmart.kotlin.core.network

import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * OkHttp interceptor that automatically attaches the stored auth token
 * to every outgoing request as a Bearer token header.
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val userPreferences: UserPreferences,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { userPreferences.accessToken.first() }

        val request = if (token.isNotBlank()) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }

        return chain.proceed(request)
    }
}
