package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.domain.model.CartItem
import kotlinx.coroutines.flow.Flow

interface CartRepository {
    fun getCartItems(): Flow<List<CartItem>>
    suspend fun getCartCount(): Int
    suspend fun addToCart(item: CartItem)
    suspend fun updateQuantity(productId: String, qty: Int)
    suspend fun removeFromCart(productId: String)
    suspend fun clearCart()
}
