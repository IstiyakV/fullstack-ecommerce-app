package com.shopperzmart.kotlin.data.local.dao

import androidx.room.*
import com.shopperzmart.kotlin.data.local.entity.CartEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CartDao {
    @Query("SELECT * FROM cart_items")
    fun getAllCartItems(): Flow<List<CartEntity>>

    @Query("SELECT COUNT(*) FROM cart_items")
    suspend fun getCartCount(): Int

    @Upsert
    suspend fun upsertItem(item: CartEntity)

    @Query("UPDATE cart_items SET quantity = :qty WHERE productId = :productId")
    suspend fun updateQuantity(productId: String, qty: Int)

    @Delete
    suspend fun deleteItem(item: CartEntity)

    @Query("DELETE FROM cart_items")
    suspend fun clearCart()
}
