package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.data.local.dao.CartDao
import com.shopperzmart.kotlin.data.local.entity.CartEntity
import com.shopperzmart.kotlin.domain.model.CartItem
import com.shopperzmart.kotlin.domain.repository.CartRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class CartRepositoryImpl @Inject constructor(
    private val dao: CartDao
) : CartRepository {

    override fun getCartItems(): Flow<List<CartItem>> =
        dao.getAllCartItems().map { list -> list.map { it.toCartItem() } }

    override suspend fun getCartCount(): Int = dao.getCartCount()

    override suspend fun addToCart(item: CartItem) {
        dao.upsertItem(item.toEntity())
    }

    override suspend fun updateQuantity(productId: String, qty: Int) {
        if (qty <= 0) dao.deleteItem(CartEntity(
            productId = productId, productName = "", image = "",
            sellingPrice = 0.0, regularPrice = 0.0, quantity = 0,
            shopName = "", deliveryCharge = ""
        ))
        else dao.updateQuantity(productId, qty)
    }

    override suspend fun removeFromCart(productId: String) {
        dao.deleteItem(CartEntity(
            productId = productId, productName = "", image = "",
            sellingPrice = 0.0, regularPrice = 0.0, quantity = 0,
            shopName = "", deliveryCharge = ""
        ))
    }

    override suspend fun clearCart() = dao.clearCart()

    private fun CartEntity.toCartItem() = CartItem(
        productId = productId, productName = productName, image = image,
        sellingPrice = sellingPrice, regularPrice = regularPrice, quantity = quantity,
        shopName = shopName, deliveryCharge = deliveryCharge,
    )

    private fun CartItem.toEntity() = CartEntity(
        productId = productId, productName = productName, image = image,
        sellingPrice = sellingPrice, regularPrice = regularPrice, quantity = quantity,
        shopName = shopName, deliveryCharge = deliveryCharge,
    )
}
