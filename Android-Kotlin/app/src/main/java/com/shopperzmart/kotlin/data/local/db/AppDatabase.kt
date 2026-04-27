package com.shopperzmart.kotlin.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.shopperzmart.kotlin.data.local.dao.CartDao
import com.shopperzmart.kotlin.data.local.dao.WishlistDao
import com.shopperzmart.kotlin.data.local.dao.RecentlyViewedDao
import com.shopperzmart.kotlin.data.local.entity.CartEntity
import com.shopperzmart.kotlin.data.local.entity.WishlistEntity
import com.shopperzmart.kotlin.data.local.entity.RecentlyViewedEntity

@Database(
    entities = [CartEntity::class, WishlistEntity::class, RecentlyViewedEntity::class],
    version  = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun cartDao(): CartDao
    abstract fun wishlistDao(): WishlistDao
    abstract fun recentlyViewedDao(): RecentlyViewedDao
}
