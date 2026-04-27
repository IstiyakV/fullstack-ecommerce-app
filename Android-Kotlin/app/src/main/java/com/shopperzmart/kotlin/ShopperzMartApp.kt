package com.shopperzmart.kotlin

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.disk.DiskCache
import coil.memory.MemoryCache
import com.shopperzmart.kotlin.core.utils.Constants
import dagger.hilt.android.HiltAndroidApp
import java.io.File

@HiltAndroidApp
class ShopperzMartApp : Application(), ImageLoaderFactory {
    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .components {
                add(coil.intercept.Interceptor { chain ->
                    val data = chain.request.data
                    val newRequest = if (data is String) {
                        val resolvedUrl = Constants.resolveImageUrl(data) ?: data
                        chain.request.newBuilder().data(resolvedUrl).build()
                    } else {
                        chain.request
                    }
                    chain.proceed(newRequest)
                })
            }
            // ── Memory Cache (25% of app heap) ──────────────────────────
            .memoryCache {
                MemoryCache.Builder(this)
                    .maxSizePercent(0.25)
                    .strongReferencesEnabled(true)
                    .build()
            }
            // ── Disk Cache (250 MB) ─────────────────────────────────────
            .diskCache {
                DiskCache.Builder()
                    .directory(File(cacheDir, "image_cache"))
                    .maxSizeBytes(250L * 1024 * 1024) // 250 MB
                    .build()
            }
            .crossfade(300)
            .respectCacheHeaders(false) // Ignore server cache headers — always cache
            .build()
    }
}
