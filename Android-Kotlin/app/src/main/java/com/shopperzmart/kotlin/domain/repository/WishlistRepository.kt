package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.data.local.entity.WishlistEntity
import kotlinx.coroutines.flow.Flow

interface WishlistRepository {
    fun getWishlistItems(): Flow<List<WishlistEntity>>
    suspend fun toggleWishlist(item: WishlistEntity)
    fun checkExists(productId: String): Flow<Boolean>
    suspend fun remove(productId: String)
}
