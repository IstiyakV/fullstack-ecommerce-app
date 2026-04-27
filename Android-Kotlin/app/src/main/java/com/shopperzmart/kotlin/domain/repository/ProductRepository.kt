package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.*

data class ProductDetailResult(
    val product: Product,
    val images: List<String>,
    val relatedProducts: List<Product>,
    val reviews: List<Review>,
    val variantTypes: List<VariantType>,
    val skus: List<ProductSku>,
    val reviewSummary: ReviewSummary?,
)

interface ProductRepository {
    suspend fun getProductDetails(productId: String): Result<ProductDetailResult?>
    suspend fun filterProducts(filters: Map<String, String>): Result<List<Product>>
    suspend fun filterWsProducts(filters: Map<String, Any>): Result<List<Product>>
    suspend fun writeReview(productId: String, rating: Int, title: String, comment: String): Result<String>
}
