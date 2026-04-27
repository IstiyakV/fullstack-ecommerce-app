package com.shopperzmart.kotlin.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cart_items")
data class CartEntity(
    @PrimaryKey val productId: String,
    val productName: String,
    val image: String,
    val sellingPrice: Double,
    val regularPrice: Double,
    val quantity: Int,
    val shopName: String,
    val deliveryCharge: String,
)
