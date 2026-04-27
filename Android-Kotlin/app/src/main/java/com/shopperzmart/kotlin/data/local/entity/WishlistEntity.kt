package com.shopperzmart.kotlin.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "wishlist")
data class WishlistEntity(
    @PrimaryKey
    val productId: String,
    val productName: String,
    val sellingPrice: Double,
    val image: String,
    val shopName: String,
    val savedAt: Long = System.currentTimeMillis()
)
