package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.data.local.dao.WishlistDao
import com.shopperzmart.kotlin.data.local.entity.WishlistEntity
import com.shopperzmart.kotlin.domain.repository.WishlistRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class WishlistRepositoryImpl @Inject constructor(
    private val dao: WishlistDao
) : WishlistRepository {
    override fun getWishlistItems(): Flow<List<WishlistEntity>> = dao.getAllWishlistItems()

    override suspend fun toggleWishlist(item: WishlistEntity) {
        val exists = dao.checkExists(item.productId).first()
        if (exists) {
            dao.deleteItem(item.productId)
        } else {
            dao.insertItem(item)
        }
    }

    override fun checkExists(productId: String): Flow<Boolean> = dao.checkExists(productId)
    
    override suspend fun remove(productId: String) = dao.deleteItem(productId)
}
