package com.shopperzmart.kotlin.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "recently_viewed")
data class RecentlyViewedEntity(
    @PrimaryKey
    val productId: String,
    val productName: String,
    val sellingPrice: Double,
    val image: String,
    val viewedAt: Long = System.currentTimeMillis()
)
