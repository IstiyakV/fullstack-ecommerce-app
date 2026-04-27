package com.shopperzmart.kotlin.domain.model

data class Order(
    val orderId: String,
    val totalAmount: Double,
    val orderStatus: String,
    val date: String,
)

data class OrderDetail(
    val orderId: String,
    val customerId: String,
    val totalAmount: Double,
    val shippingFee: Double,
    val discountAmount: Double,
    val couponCode: String,
    val shippingMethod: String,
    val paymentMethod: String,
    val paymentStatus: String,
    val orderStatus: String,
    val estimatedDelivery: String,
    val trackingNumber: String,
    val trackingUrl: String,
    val createdAt: String,
    val canCancel: Boolean,
    val items: List<OrderItem>,
    val shippingAddress: OrderAddress,
    val timeline: List<TimelineEntry>,
)

data class OrderItem(
    val productId: String,
    val productName: String,
    val image: String,
    val sellingPrice: Double,
    val quantity: Int,
    val shopName: String,
)

data class OrderAddress(
    val recipientName: String,
    val phone: String,
    val fullAddress: String,
    val cityName: String,
    val postalCode: String,
    val label: String,
)

data class TimelineEntry(
    val timelineId: String,
    val status: String,
    val note: String,
    val timestamp: String,
)
