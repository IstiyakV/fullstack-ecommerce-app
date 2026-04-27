package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.data.remote.mapper.toDomain
import com.shopperzmart.kotlin.domain.model.Product
import com.shopperzmart.kotlin.domain.repository.ProductDetailResult
import com.shopperzmart.kotlin.domain.repository.ProductRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import javax.inject.Inject

class ProductRepositoryImpl @Inject constructor(
    private val api: ApiService,
    private val prefs: UserPreferences,
) : ProductRepository {

    override suspend fun getProductDetails(productId: String): Result<ProductDetailResult?> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getProductDetails(mapOf("product_id" to productId))
                if (res.statusCode == 200 && res.data != null) {
                    val product = res.data.toDomain()
                    val images = buildList {
                        // Always include featured image first
                        add(product.featuredImage)
                        // Add additional images from API (skip duplicates)
                        res.images?.forEach { img ->
                            val url = img.image ?: ""
                            if (url.isNotBlank() && url != product.featuredImage) add(url)
                        }
                    }
                    val related = res.relatedProducts?.map { it.toDomain() } ?: emptyList()
                    val reviews = res.reviews?.map { it.toDomain() } ?: emptyList()
                    val variantTypes = res.variantTypes?.map { it.toDomain() } ?: emptyList()
                    val skus = res.skus?.map { it.toDomain() } ?: emptyList()
                    val reviewSummary = res.reviewSummary?.toDomain()
                    Result.Success(ProductDetailResult(product, images, related, reviews, variantTypes, skus, reviewSummary))
                } else {
                    Result.Error(res.message ?: "Error")
                }
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun filterProducts(filters: Map<String, String>): Result<List<Product>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.filterProducts(filters)
                if (res.statusCode == 200) {
                    Result.Success(res.data?.map { it.toDomain() } ?: emptyList())
                } else Result.Error(res.message ?: "Error")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun filterWsProducts(filters: Map<String, Any>): Result<List<Product>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.filterWsProducts(filters)
                if (res.statusCode == 200) {
                    Result.Success(res.data?.map { it.toDomain() } ?: emptyList())
                } else Result.Error(res.message ?: "Error")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun writeReview(productId: String, rating: Int, title: String, comment: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val userKey = prefs.userKey.first()
                val userName = prefs.userName.first()
                val body = mapOf<String, Any>(
                    "product_id" to productId,
                    "user_key" to userKey,
                    "customer_name" to userName,
                    "rating" to rating.toString(),
                    "title" to title,
                    "comment" to comment,
                )
                val res = api.writeReview(body)
                if (res.statusCode == 200) {
                    Result.Success(res.message ?: "Review submitted!")
                } else Result.Error(res.message ?: "Error")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }
}

