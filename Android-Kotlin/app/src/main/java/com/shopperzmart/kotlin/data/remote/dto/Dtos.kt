package com.shopperzmart.kotlin.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ProductDto(
    @Json(name = "product_id")          val productId: String?,
    @Json(name = "product_name")        val productName: String?,
    @Json(name = "selling_price")       val sellingPrice: String?,
    @Json(name = "regular_price")       val regularPrice: String?,
    @Json(name = "discount_rate")       val discountRate: String?,
    @Json(name = "featured_image")      val featuredImage: String?,
    @Json(name = "image")               val image: String?,
    @Json(name = "stock")               val stock: String?,
    @Json(name = "product_type")        val productType: String?,
    @Json(name = "category_id")         val categoryId: String?,
    @Json(name = "category_name_en")    val categoryNameEn: String?,
    @Json(name = "shop_id")             val shopId: String?,
    @Json(name = "shop_name")           val shopName: String?,
    @Json(name = "delivery_charge")     val deliveryCharge: String?,
    @Json(name = "product_rating")      val productRating: String?,
    @Json(name = "shop_rating")         val shopRating: String?,
    @Json(name = "product_details")     val productDetails: String?,
    @Json(name = "product_specification") val productSpecification: String?,
    @Json(name = "is_active")           val isActive: String?,
    @Json(name = "is_whole_sales")      val isWholeSales: String?,
    @Json(name = "stock_status")        val stockStatus: String?,
    @Json(name = "minimum_order_quantity") val minimumOrderQuantity: String?,
)

@JsonClass(generateAdapter = true)
data class SliderDto(
    @Json(name = "slider_id")    val sliderId: String?,
    @Json(name = "slider_image") val sliderImage: String?,
    @Json(name = "slider_title") val sliderTitle: String?,
    @Json(name = "slider_url")   val sliderUrl: String?,
)

@JsonClass(generateAdapter = true)
data class BannerSliderDto(
    @Json(name = "promotional_slider_id")   val promotionalSliderId: String?,
    @Json(name = "section_id")              val sectionId: String?,
    @Json(name = "slider_image")            val sliderImage: String?,
    @Json(name = "slider_mobile_image")     val sliderMobileImage: String?,
    @Json(name = "slider_title")            val sliderTitle: String?,
    @Json(name = "slider_url")              val sliderUrl: String?,
)

@JsonClass(generateAdapter = true)
data class CategoryDto(
    @Json(name = "parent_category_id")       val parentCategoryId: String?,
    @Json(name = "parent_category_name_en")  val parentCategoryNameEn: String?,
    @Json(name = "parent_category_name_bn")  val parentCategoryNameBn: String?,
    @Json(name = "featured_image")           val featuredImage: String?,
    @Json(name = "is_active")                val isActive: String?,
)

@JsonClass(generateAdapter = true)
data class BrandDto(
    @Json(name = "brand_id")         val brandId: String?,
    @Json(name = "brand_image")      val brandImage: String?,
    @Json(name = "category_name_en") val categoryNameEn: String?,
)

@JsonClass(generateAdapter = true)
data class WholeSaleCategoryDto(
    @Json(name = "whole_sale_category_id") val wholeSaleCategoryId: String?,
    @Json(name = "category_name_en")       val categoryNameEn: String?,
    @Json(name = "category_name_bn")       val categoryNameBn: String?,
    @Json(name = "category_image")         val categoryImage: String?,
)

@JsonClass(generateAdapter = true)
data class HomeResponseDto(
    @Json(name = "status_code")       val statusCode: Int?,
    @Json(name = "message")           val message: String?,
    @Json(name = "sliders")           val sliders: List<SliderDto>?,
    @Json(name = "top_categories")    val topCategories: List<CategoryDto>?,
    @Json(name = "new_arrivals")      val newArrivals: List<ProductDto>?,
    @Json(name = "hot_deals")         val hotDeals: List<ProductDto>?,
    @Json(name = "full_slider")       val fullSlider: List<BannerSliderDto>?,
    @Json(name = "whole_sale")        val wholeSale: List<WholeSaleCategoryDto>?,
    @Json(name = "gadgets")           val gadgets: List<ProductDto>?,
    @Json(name = "half_slider")       val halfSlider: List<BannerSliderDto>?,
    @Json(name = "categories")        val categories: List<CategoryDto>?,
    @Json(name = "brands")            val brands: List<BrandDto>?,
    @Json(name = "popular_products")  val popularProducts: List<ProductDto>?,
)

@JsonClass(generateAdapter = true)
data class LoginResponseDto(
    @Json(name = "status_code")       val statusCode: Int?,
    @Json(name = "message")           val message: String?,
    @Json(name = "access_token")      val accessToken: String?,
    @Json(name = "data")              val data: CustomerDto?,
)

@JsonClass(generateAdapter = true)
data class CustomerDto(
    @Json(name = "customer_id")       val customerId: String?,
    @Json(name = "customer_name")     val customerName: String?,
    @Json(name = "customer_phone")    val customerPhone: String?,
    @Json(name = "customer_email")    val customerEmail: String?,
    @Json(name = "image")             val image: String?,
    @Json(name = "is_active")         val isActive: String?,
)

@JsonClass(generateAdapter = true)
data class ProductDetailsResponseDto(
    @Json(name = "status_code")       val statusCode: Int?,
    @Json(name = "message")           val message: String?,
    @Json(name = "data")              val data: ProductDto?,
    @Json(name = "related_products")  val relatedProducts: List<ProductDto>?,
    @Json(name = "images")            val images: List<ProductImageDto>?,
    @Json(name = "reviews")           val reviews: List<ReviewDto>?,
    @Json(name = "variant_types")     val variantTypes: List<VariantTypeDto>?,
    @Json(name = "skus")              val skus: List<ProductSkuDto>?,
    @Json(name = "review_summary")    val reviewSummary: ReviewSummaryDto?,
)

@JsonClass(generateAdapter = true)
data class ProductImageDto(
    @Json(name = "image_id")   val imageId: String?,
    @Json(name = "image_url")  val image: String?,
)

@JsonClass(generateAdapter = true)
data class ReviewDto(
    @Json(name = "review_id")        val reviewId: String?,
    @Json(name = "product_id")       val productId: String?,
    @Json(name = "customer_id")      val customerId: String?,
    @Json(name = "customer_name")    val customerName: String?,
    @Json(name = "rating")           val rating: String?,
    @Json(name = "title")            val title: String?,
    @Json(name = "comment")          val comment: String?,
    @Json(name = "verified_purchase") val verifiedPurchase: String?,
    @Json(name = "created_at")       val createdAt: String?,
)

@JsonClass(generateAdapter = true)
data class FilterProductResponseDto(
    @Json(name = "status_code")  val statusCode: Int?,
    @Json(name = "message")      val message: String?,
    @Json(name = "data")         val data: List<ProductDto>?,
    @Json(name = "total_count")  val totalCount: Int?,
    @Json(name = "page")         val page: Int?,
    @Json(name = "per_page")     val perPage: Int?,
)

@JsonClass(generateAdapter = true)
data class BaseResponseDto(
    @Json(name = "status_code")      val statusCode: Int?,
    @Json(name = "message")          val message: String?,
    @Json(name = "access_token")     val accessToken: String?,
)

@JsonClass(generateAdapter = true)
data class NotificationDto(
    @Json(name = "notification_id") val notificationId: String?,
    @Json(name = "title")           val title: String?,
    @Json(name = "message")         val message: String?,
    @Json(name = "is_read")         val isRead: String?,
    @Json(name = "created_at")      val createdAt: String?,
)

@JsonClass(generateAdapter = true)
data class NotificationsResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "data")        val data: List<NotificationDto>?,
)

@JsonClass(generateAdapter = true)
data class VoucherDto(
    @Json(name = "voucher_id")       val voucherId: String?,
    @Json(name = "voucher_code")     val voucherCode: String?,
    @Json(name = "voucher_title")    val voucherTitle: String?,
    @Json(name = "discount_amount")  val discountAmount: String?,
    @Json(name = "discount_percent") val discountPercent: String?,
    @Json(name = "is_active")        val isActive: String?,
    @Json(name = "expiry_date")      val expiryDate: String?,
)

@JsonClass(generateAdapter = true)
data class OrderDto(
    @Json(name = "order_id")        val orderId: String?,
    @Json(name = "total_amount")    val totalAmount: String?,
    @Json(name = "order_status")    val orderStatus: String?,
    @Json(name = "created_at")      val createdAt: String?,
)

@JsonClass(generateAdapter = true)
data class OrdersResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "message")     val message: String?,
    @Json(name = "data")        val data: List<OrderDto>?,
)

// ── Order Detail DTOs ───────────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class OrderDetailResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "message")     val message: String?,
    @Json(name = "data")        val data: OrderDetailDataDto?,
)

@JsonClass(generateAdapter = true)
data class OrderDetailDataDto(
    @Json(name = "order_id")          val orderId: String?,
    @Json(name = "customer_id")       val customerId: String?,
    @Json(name = "total_amount")      val totalAmount: String?,
    @Json(name = "shipping_fee")      val shippingFee: String?,
    @Json(name = "discount_amount")   val discountAmount: String?,
    @Json(name = "coupon_code")       val couponCode: String?,
    @Json(name = "shipping_method")   val shippingMethod: String?,
    @Json(name = "payment_method")    val paymentMethod: String?,
    @Json(name = "payment_status")    val paymentStatus: String?,
    @Json(name = "order_status")      val orderStatus: String?,
    @Json(name = "estimated_delivery") val estimatedDelivery: String?,
    @Json(name = "tracking_number")   val trackingNumber: String?,
    @Json(name = "tracking_url")      val trackingUrl: String?,
    @Json(name = "created_at")        val createdAt: String?,
    @Json(name = "can_cancel")         val canCancel: Boolean?,
    @Json(name = "items")             val items: List<OrderItemDto>?,
    @Json(name = "shipping_address")  val shippingAddress: OrderAddressDto?,
    @Json(name = "timeline")          val timeline: List<TimelineEntryDto>?,
)

@JsonClass(generateAdapter = true)
data class OrderItemDto(
    @Json(name = "product_id")    val productId: String?,
    @Json(name = "product_name")  val productName: String?,
    @Json(name = "image")         val image: String?,
    @Json(name = "selling_price") val sellingPrice: String?,
    @Json(name = "quantity")      val quantity: String?,
    @Json(name = "shop_name")     val shopName: String?,
)

@JsonClass(generateAdapter = true)
data class OrderAddressDto(
    @Json(name = "recipient_name") val recipientName: String?,
    @Json(name = "phone")          val phone: String?,
    @Json(name = "full_address")   val fullAddress: String?,
    @Json(name = "city_name")      val cityName: String?,
    @Json(name = "postal_code")    val postalCode: String?,
    @Json(name = "label")          val label: String?,
)

@JsonClass(generateAdapter = true)
data class TimelineEntryDto(
    @Json(name = "timeline_id") val timelineId: String?,
    @Json(name = "status")      val status: String?,
    @Json(name = "note")        val note: String?,
    @Json(name = "timestamp")   val timestamp: String?,
)

// ── Address DTOs ────────────────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class AddressDto(
    @Json(name = "address_id")     val addressId: String?,
    @Json(name = "customer_id")    val customerId: String?,
    @Json(name = "recipient_name") val recipientName: String?,
    @Json(name = "phone")          val phone: String?,
    @Json(name = "full_address")   val fullAddress: String?,
    @Json(name = "city_id")        val cityId: String?,
    @Json(name = "city_name")      val cityName: String?,
    @Json(name = "postal_code")    val postalCode: String?,
    @Json(name = "label")          val label: String?,
    @Json(name = "is_default")     val isDefault: String?,
)

@JsonClass(generateAdapter = true)
data class AddressListResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "message")     val message: String?,
    @Json(name = "data")        val data: List<AddressDto>?,
)

// ── Config DTOs (Phase 2.5) ─────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class CityDto(
    @Json(name = "city_id")          val cityId: String?,
    @Json(name = "city_name")        val cityName: String?,
    @Json(name = "division")         val division: String?,
    @Json(name = "postal_code")      val postalCode: String?,
    @Json(name = "shipping_zone_id") val shippingZoneId: String?,
)

@JsonClass(generateAdapter = true)
data class ShippingZoneDto(
    @Json(name = "zone_id")           val zoneId: String?,
    @Json(name = "zone_name")         val zoneName: String?,
    @Json(name = "has_standard")      val hasStandard: String?,
    @Json(name = "standard_fee")      val standardFee: String?,
    @Json(name = "standard_min_days") val standardMinDays: String?,
    @Json(name = "standard_max_days") val standardMaxDays: String?,
    @Json(name = "has_express")       val hasExpress: String?,
    @Json(name = "express_fee")       val expressFee: String?,
    @Json(name = "express_min_days")  val expressMinDays: String?,
    @Json(name = "express_max_days")  val expressMaxDays: String?,
)

@JsonClass(generateAdapter = true)
data class PaymentGatewayDto(
    @Json(name = "gateway_id")   val gatewayId: String?,
    @Json(name = "gateway_name") val gatewayName: String?,
    @Json(name = "display_name") val displayName: String?,
    @Json(name = "icon_url")     val iconUrl: String?,
    @Json(name = "sort_order")   val sortOrder: String?,
    @Json(name = "payment_type") val paymentType: String?,
)

@JsonClass(generateAdapter = true)
data class CityListResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "data")        val data: List<CityDto>?,
)

@JsonClass(generateAdapter = true)
data class ShippingZoneResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "data")        val data: ShippingZoneDataDto?,
)

@JsonClass(generateAdapter = true)
data class ShippingZoneDataDto(
    @Json(name = "city")          val city: CityDto?,
    @Json(name = "shipping_zone") val shippingZone: ShippingZoneDto?,
)

@JsonClass(generateAdapter = true)
data class ShippingZoneListResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "data")        val data: List<ShippingZoneDto>?,
)

@JsonClass(generateAdapter = true)
data class AppConfigResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "data")        val data: Map<String, String>?,
)

@JsonClass(generateAdapter = true)
data class PaymentGatewayListResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "data")        val data: List<PaymentGatewayDto>?,
)

// ── Voucher / Coupon Response ───────────────────────────────────────────
data class VoucherListResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "message")     val message: String?,
    @Json(name = "data")        val data: List<VoucherDto>?,
)

@JsonClass(generateAdapter = true)
data class ApplyCouponResponseDto(
    @Json(name = "status_code") val statusCode: Int?,
    @Json(name = "message")     val message: String?,
    @Json(name = "data")        val data: VoucherDto?,
)

// ── Variant DTOs (Phase 1: SKU Variant System) ──────────────────────────

@JsonClass(generateAdapter = true)
data class VariantTypeDto(
    @Json(name = "type_id")    val typeId: String?,
    @Json(name = "type_name")  val typeName: String?,
    @Json(name = "sort_order") val sortOrder: String?,
    @Json(name = "options")    val options: List<VariantOptionDto>?,
)

@JsonClass(generateAdapter = true)
data class VariantOptionDto(
    @Json(name = "option_id")       val optionId: String?,
    @Json(name = "option_value")    val optionValue: String?,
    @Json(name = "option_image")    val optionImage: String?,
    @Json(name = "is_default")      val isDefault: String?,
    @Json(name = "sort_order")      val sortOrder: String?,
    @Json(name = "gallery_images")  val galleryImages: List<String>?,
)

@JsonClass(generateAdapter = true)
data class ProductSkuDto(
    @Json(name = "sku_id")       val skuId: String?,
    @Json(name = "sku_code")     val skuCode: String?,
    @Json(name = "combination")  val combination: String?,
    @Json(name = "price")        val price: String?,
    @Json(name = "regular_price") val regularPrice: String?,
    @Json(name = "stock")        val stock: String?,
    @Json(name = "is_active")    val isActive: String?,
)

@JsonClass(generateAdapter = true)
data class ReviewSummaryDto(
    @Json(name = "average_rating")    val averageRating: String?,
    @Json(name = "total_reviews")     val totalReviews: String?,
    @Json(name = "star_distribution") val starDistribution: Map<String, Int>?,
)
