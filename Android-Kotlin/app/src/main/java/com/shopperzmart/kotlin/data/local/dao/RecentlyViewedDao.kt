package com.shopperzmart.kotlin.data.local.dao

import androidx.room.*
import com.shopperzmart.kotlin.data.local.entity.RecentlyViewedEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RecentlyViewedDao {
    @Query("SELECT * FROM recently_viewed ORDER BY viewedAt DESC LIMIT 20")
    fun getRecentlyViewed(): Flow<List<RecentlyViewedEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(item: RecentlyViewedEntity)

    @Query("DELETE FROM recently_viewed WHERE productId NOT IN (SELECT productId FROM recently_viewed ORDER BY viewedAt DESC LIMIT 50)")
    suspend fun trimOld()

    @Query("DELETE FROM recently_viewed")
    suspend fun clearAll()
}
