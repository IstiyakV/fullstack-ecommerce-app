package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.HomeFeed

interface HomeRepository {
    suspend fun getHomeFeed(): Result<HomeFeed>
}
