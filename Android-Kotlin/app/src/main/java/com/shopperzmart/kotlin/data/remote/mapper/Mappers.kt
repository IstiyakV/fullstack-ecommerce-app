package com.shopperzmart.kotlin.data.remote.mapper

import com.shopperzmart.kotlin.data.remote.dto.*
import com.shopperzmart.kotlin.domain.model.*
import org.json.JSONObject

fun ProductDto.toDomain() = Product(
    productId    = productId?.toString() ?: "",
    productName  = productName ?: "",
    sellingPrice = sellingPrice?.toDoubleOrNull() ?: 0.0,
    regularPrice = regularPrice?.toDoubleOrNull() ?: 0.0,
    discountRate = discountRate ?: "0",
    featuredImage = featuredImage ?: "",
    image        = image ?: featuredImage ?: "",
    stock        = stock ?: "0",
    productType  = productType ?: "retail",
    categoryId   = categoryId ?: "",
    categoryNameEn = categoryNameEn ?: "",
    shopId       = shopId ?: "",
    shopName     = shopName ?: "",
    deliveryCharge = deliveryCharge ?: "0",
    productRating  = productRating ?: "0",
    shopRating     = shopRating ?: "0",
    productDetails = productDetails ?: "",
    productSpecification = productSpecification ?: "",
    isActive       = isActive ?: "1",
    isWholeSales   = isWholeSales ?: "0",
    stockStatus    = stockStatus ?: "in_stock",
    minimumOrderQuantity = minimumOrderQuantity ?: "1",
)

fun SliderDto.toDomain() = Slider(
    sliderId    = sliderId?.toString() ?: "",
    sliderImage = sliderImage ?: "",
    sliderTitle = sliderTitle ?: "",
    sliderUrl   = sliderUrl ?: "",
)

fun BannerSliderDto.toDomain() = BannerSlider(
    promotionalSliderId = promotionalSliderId?.toString() ?: "",
    sectionId      = sectionId ?: "",
    sliderImage    = sliderImage ?: "",
    sliderMobileImage = sliderMobileImage ?: sliderImage ?: "",
    sliderTitle    = sliderTitle ?: "",
    sliderUrl      = sliderUrl ?: "",
)

fun CategoryDto.toDomain() = Category(
    parentCategoryId      = parentCategoryId?.toString() ?: "",
    parentCategoryNameEn  = parentCategoryNameEn ?: "",
    parentCategoryNameBn  = parentCategoryNameBn ?: "",
    featuredImage         = featuredImage ?: "",
    isActive              = isActive ?: "1",
)

fun BrandDto.toDomain() = Brand(
    brandId       = brandId?.toString() ?: "",
    brandImage    = brandImage ?: "",
    categoryNameEn = categoryNameEn ?: "",
)

fun WholeSaleCategoryDto.toDomain() = WholeSaleCategory(
    wholeSaleCategoryId = wholeSaleCategoryId ?: "",
    categoryNameEn  = categoryNameEn ?: "",
    categoryNameBn  = categoryNameBn ?: "",
    categoryImage   = categoryImage ?: "",
)

fun CustomerDto.toDomain(token: String) = Customer(
    customerId   = customerId ?: "",
    customerName = customerName ?: "",
    customerPhone = customerPhone ?: "",
    customerEmail = customerEmail ?: "",
    image        = image,
    isActive     = isActive ?: "1",
    accessToken  = token,
)

fun HomeResponseDto.toDomain() = HomeFeed(
    sliders       = sliders?.map { it.toDomain() } ?: emptyList(),
    topCategories = topCategories?.map { it.toDomain() } ?: emptyList(),
    newArrivals   = newArrivals?.map { it.toDomain() } ?: emptyList(),
    hotDeals      = hotDeals?.map { it.toDomain() } ?: emptyList(),
    fullSlider    = fullSlider?.map { it.toDomain() } ?: emptyList(),
    wholeSale     = wholeSale?.map { it.toDomain() } ?: emptyList(),
    gadgets       = gadgets?.map { it.toDomain() } ?: emptyList(),
    halfSlider    = halfSlider?.map { it.toDomain() } ?: emptyList(),
    categories    = categories?.map { it.toDomain() } ?: emptyList(),
    brands        = brands?.map { it.toDomain() } ?: emptyList(),
    popularProducts = popularProducts?.map { it.toDomain() } ?: emptyList(),
)

fun NotificationDto.toDomain() = Notification(
    notificationId = notificationId ?: "",
    title     = title ?: "",
    message   = message ?: "",
    isRead    = isRead ?: "0",
    createdAt = createdAt ?: "",
)

fun VoucherDto.toDomain() = Voucher(
    voucherId       = voucherId ?: "",
    voucherCode     = voucherCode ?: "",
    voucherTitle    = voucherTitle ?: "",
    discountAmount  = discountAmount?.toDoubleOrNull() ?: 0.0,
    discountPercent = discountPercent?.toDoubleOrNull() ?: 0.0,
    isActive        = isActive == "1",
    expiryDate      = expiryDate ?: "",
)

fun ReviewDto.toDomain() = Review(
    reviewId         = reviewId ?: "",
    productId        = productId ?: "",
    customerId       = customerId ?: "",
    customerName     = customerName ?: "Anonymous",
    rating           = rating?.toIntOrNull() ?: 5,
    title            = title ?: "",
    comment          = comment ?: "",
    verifiedPurchase = verifiedPurchase == "1",
    createdAt        = createdAt ?: "",
)

fun OrderDetailDataDto.toDomain() = OrderDetail(
    orderId           = orderId ?: "",
    customerId        = customerId ?: "",
    totalAmount       = totalAmount?.toDoubleOrNull() ?: 0.0,
    shippingFee       = shippingFee?.toDoubleOrNull() ?: 0.0,
    discountAmount    = discountAmount?.toDoubleOrNull() ?: 0.0,
    couponCode        = couponCode ?: "",
    shippingMethod    = shippingMethod ?: "standard",
    paymentMethod     = paymentMethod ?: "cod",
    paymentStatus     = paymentStatus ?: "pending",
    orderStatus       = orderStatus ?: "pending",
    estimatedDelivery = estimatedDelivery ?: "",
    trackingNumber    = trackingNumber ?: "",
    trackingUrl       = trackingUrl ?: "",
    createdAt         = createdAt ?: "",
    canCancel         = canCancel ?: false,
    items             = items?.map { it.toDomain() } ?: emptyList(),
    shippingAddress   = shippingAddress?.toDomain() ?: OrderAddress("", "", "", "", "", ""),
    timeline          = timeline?.map { it.toDomain() } ?: emptyList(),
)

fun OrderItemDto.toDomain() = OrderItem(
    productId    = productId ?: "",
    productName  = productName ?: "",
    image        = image ?: "",
    sellingPrice = sellingPrice?.toDoubleOrNull() ?: 0.0,
    quantity     = quantity?.toIntOrNull() ?: 1,
    shopName     = shopName ?: "",
)

fun OrderAddressDto.toDomain() = OrderAddress(
    recipientName = recipientName ?: "",
    phone         = phone ?: "",
    fullAddress   = fullAddress ?: "",
    cityName      = cityName ?: "",
    postalCode    = postalCode ?: "",
    label         = label ?: "",
)

fun TimelineEntryDto.toDomain() = TimelineEntry(
    timelineId = timelineId ?: "",
    status     = status ?: "",
    note       = note ?: "",
    timestamp  = timestamp ?: "",
)

// ── Variant Mappers ─────────────────────────────────────────────────────

fun VariantTypeDto.toDomain() = VariantType(
    typeId    = typeId ?: "",
    typeName  = typeName ?: "",
    sortOrder = sortOrder?.toIntOrNull() ?: 0,
    options   = options?.map { it.toDomain() } ?: emptyList(),
)

fun VariantOptionDto.toDomain() = VariantOption(
    optionId      = optionId ?: "",
    optionValue   = optionValue ?: "",
    optionImage   = optionImage ?: "",
    isDefault     = isDefault == "1",
    sortOrder     = sortOrder?.toIntOrNull() ?: 0,
    galleryImages = galleryImages ?: emptyList(),
)

fun ProductSkuDto.toDomain(): ProductSku {
    val comboMap = mutableMapOf<String, String>()
    try {
        val json = JSONObject(combination ?: "{}")
        json.keys().forEach { key -> comboMap[key] = json.getString(key) }
    } catch (_: Exception) { /* ignore malformed JSON */ }
    return ProductSku(
        skuId        = skuId ?: "",
        skuCode      = skuCode ?: "",
        combination  = comboMap,
        price        = price?.toDoubleOrNull() ?: 0.0,
        regularPrice = regularPrice?.toDoubleOrNull() ?: 0.0,
        stock        = stock?.toIntOrNull() ?: 0,
        isActive     = isActive == "1",
    )
}

fun ReviewSummaryDto.toDomain() = ReviewSummary(
    averageRating    = averageRating?.toDoubleOrNull() ?: 0.0,
    totalReviews     = totalReviews?.toIntOrNull() ?: 0,
    starDistribution = starDistribution?.mapKeys { it.key.toIntOrNull() ?: 0 } ?: emptyMap(),
)
