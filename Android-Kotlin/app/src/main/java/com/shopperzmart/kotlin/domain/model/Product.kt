package com.shopperzmart.kotlin.domain.model

data class Product(
    val productId: String,
    val productName: String,
    val sellingPrice: Double,
    val regularPrice: Double,
    val discountRate: String,
    val featuredImage: String,
    val image: String,
    val stock: String,
    val productType: String,   // "retail" | "whole_sale"
    val categoryId: String,
    val categoryNameEn: String,
    val shopId: String,
    val shopName: String,
    val deliveryCharge: String,
    val productRating: String,
    val shopRating: String,
    val productDetails: String,
    val productSpecification: String,
    val isActive: String,
    val isWholeSales: String,
    val stockStatus: String,
    val minimumOrderQuantity: String,
)

// ── Variant System ──────────────────────────────────────────────────────

data class VariantType(
    val typeId: String,
    val typeName: String,
    val sortOrder: Int,
    val options: List<VariantOption>,
)

data class VariantOption(
    val optionId: String,
    val optionValue: String,
    val optionImage: String,
    val isDefault: Boolean,
    val sortOrder: Int,
    val galleryImages: List<String>,
)

data class ProductSku(
    val skuId: String,
    val skuCode: String,
    val combination: Map<String, String>,  // e.g. {"Color": "Black", "Storage": "256GB"}
    val price: Double,
    val regularPrice: Double,
    val stock: Int,
    val isActive: Boolean,
)

data class SelectedVariant(
    val value: String,
    val image: String,
)

data class ReviewSummary(
    val averageRating: Double,
    val totalReviews: Int,
    val starDistribution: Map<Int, Int>,  // e.g. {5: 10, 4: 5, 3: 2, ...}
)
