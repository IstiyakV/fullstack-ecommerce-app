package com.shopperzmart.kotlin.domain.model

data class Customer(
    val customerId: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String,
    val image: String?,
    val isActive: String,
    val accessToken: String,
)

data class HomeFeed(
    val sliders: List<Slider>,
    val topCategories: List<Category>,
    val newArrivals: List<Product>,
    val hotDeals: List<Product>,
    val fullSlider: List<BannerSlider>,
    val wholeSale: List<WholeSaleCategory>,
    val gadgets: List<Product>,
    val halfSlider: List<BannerSlider>,
    val categories: List<Category>,
    val brands: List<Brand>,
    val popularProducts: List<Product>,
)

data class CartItem(
    val productId: String,
    val productName: String,
    val image: String,
    val sellingPrice: Double,
    val regularPrice: Double,
    val quantity: Int,
    val shopName: String,
    val deliveryCharge: String,
)

data class Address(
    val addressId: String,
    val customerId: String,
    val recipientName: String,
    val phone: String,
    val fullAddress: String,
    val cityId: String,
    val cityName: String,
    val postalCode: String,
    val label: String,
    val isDefault: Boolean = false,
)

data class Voucher(
    val voucherId: String,
    val voucherCode: String,
    val voucherTitle: String,
    val discountAmount: Double,
    val discountPercent: Double,
    val isActive: Boolean = true,
    val expiryDate: String = "",
)

data class Notification(
    val notificationId: String,
    val title: String,
    val message: String,
    val isRead: String,
    val createdAt: String,
)

data class Review(
    val reviewId: String,
    val productId: String,
    val customerId: String,
    val customerName: String,
    val rating: Int,
    val title: String,
    val comment: String,
    val verifiedPurchase: Boolean,
    val createdAt: String,
)
