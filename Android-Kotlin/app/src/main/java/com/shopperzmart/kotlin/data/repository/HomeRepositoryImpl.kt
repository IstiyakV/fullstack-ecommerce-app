package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.remote.mapper.toDomain
import com.shopperzmart.kotlin.domain.model.*
import com.shopperzmart.kotlin.domain.repository.HomeRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

class HomeRepositoryImpl @Inject constructor(
    private val api: ApiService
) : HomeRepository {
    override suspend fun getHomeFeed(): Result<HomeFeed> = withContext(Dispatchers.IO) {
        try {
            val response = api.getHome(emptyMap())
            if (response.statusCode == 200) {
                Result.Success(response.toDomain())
            } else {
                Result.Error(response.message ?: "Unknown error", response.statusCode)
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }
}
