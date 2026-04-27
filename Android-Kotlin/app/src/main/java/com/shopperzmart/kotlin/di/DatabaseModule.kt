package com.shopperzmart.kotlin.di

import android.content.Context
import androidx.room.Room
import com.shopperzmart.kotlin.core.utils.Constants
import com.shopperzmart.kotlin.data.local.dao.CartDao
import com.shopperzmart.kotlin.data.local.dao.WishlistDao
import com.shopperzmart.kotlin.data.local.dao.RecentlyViewedDao
import com.shopperzmart.kotlin.data.local.db.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, Constants.DB_NAME)
            .fallbackToDestructiveMigration()
            .build()

    @Provides @Singleton
    fun provideCartDao(db: AppDatabase): CartDao = db.cartDao()

    @Provides @Singleton
    fun provideWishlistDao(db: AppDatabase): WishlistDao = db.wishlistDao()

    @Provides @Singleton
    fun provideRecentlyViewedDao(db: AppDatabase): RecentlyViewedDao = db.recentlyViewedDao()
}
