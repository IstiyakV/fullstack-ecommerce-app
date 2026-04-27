package com.shopperzmart.kotlin.core.network

import com.shopperzmart.kotlin.data.remote.dto.*
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Mirrors all NestJS endpoints. ALL use POST per the original app contract.
 *
 * IMPORTANT: Retrofit's Java Proxy cannot see Kotlin interface default parameter values,
 * so NO method here uses default parameters. The empty-body overloads are handled in
 * the repository layer by passing emptyMap() explicitly.
 */
interface ApiService {

    @POST("api/v1/customer/home")
    suspend fun getHome(@Body body: Map<String, String>): HomeResponseDto

    @POST("api/v1/customer/login")
    suspend fun login(@Body body: Map<String, String>): LoginResponseDto

    @POST("api/v1/customer/android-registration")
    suspend fun register(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/android-check-otp")
    suspend fun checkOtp(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/reset-pass/otp")
    suspend fun forgotPasswordOtp(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/reset-pass/check-otp")
    suspend fun forgotPasswordCheckOtp(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/reset-pass")
    suspend fun resetPassword(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/profile-update")
    suspend fun updateProfile(@Body body: Map<String, String>): LoginResponseDto


    @POST("api/v1/customer/all-categories")
    suspend fun getAllCategories(@Body body: Map<String, String>): FilterProductResponseDto

    @POST("api/v1/customer/product-details")
    suspend fun getProductDetails(@Body body: Map<String, String>): ProductDetailsResponseDto

    @POST("api/v1/customer/filtered-product")
    suspend fun filterProducts(@Body body: Map<String, String>): FilterProductResponseDto

    @POST("api/v1/customer/filtered-whole-sale-product")
    suspend fun filterWsProducts(@Body body: @JvmSuppressWildcards Map<String, Any>): FilterProductResponseDto

    @POST("api/v1/customer/whole-sale-product-details")
    suspend fun getWsProductDetails(@Body body: Map<String, String>): ProductDetailsResponseDto

    @POST("api/v1/customer/save-address")
    suspend fun saveAddress(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/get-address")
    suspend fun getAddress(@Body body: Map<String, String>): AddressListResponseDto

    @POST("api/v1/customer/order-save")
    suspend fun placeOrder(@Body body: @JvmSuppressWildcards Map<String, Any>): BaseResponseDto

    @POST("api/v1/customer/get-orders")
    suspend fun getOrders(@Body body: Map<String, String>): OrdersResponseDto

    @POST("api/v1/customer/order-details")
    suspend fun getOrderDetails(@Body body: Map<String, String>): OrderDetailResponseDto

    @POST("api/v1/customer/cancel-order")
    suspend fun cancelOrder(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/write-review")
    suspend fun writeReview(@Body body: @JvmSuppressWildcards Map<String, Any>): BaseResponseDto

    @POST("api/v1/customer/get-notifications")
    suspend fun getNotifications(@Body body: Map<String, String>): NotificationsResponseDto

    @POST("api/v1/customer/google-login")
    suspend fun googleLogin(@Body body: Map<String, String>): LoginResponseDto

    @POST("api/v1/customer/validate-token")
    suspend fun validateToken(@Body body: Map<String, String>): LoginResponseDto

    @POST("api/v1/customer/update-fcm-token")
    suspend fun updateFcmToken(@Body body: Map<String, String>): BaseResponseDto

    @POST("api/v1/customer/delete-address")
    suspend fun deleteAddress(@Body body: Map<String, String>): BaseResponseDto

    // ── Config API ──────────────────────────────────────────────────────
    @POST("api/v1/config/cities")
    suspend fun getCities(@Body body: Map<String, String>): CityListResponseDto

    @POST("api/v1/config/shipping-zones")
    suspend fun getShippingZones(@Body body: Map<String, String>): ShippingZoneListResponseDto

    @POST("api/v1/config/shipping-zone-for-city")
    suspend fun getShippingZoneForCity(@Body body: Map<String, String>): ShippingZoneResponseDto

    @POST("api/v1/config/app-config")
    suspend fun getAppConfig(@Body body: Map<String, String>): AppConfigResponseDto

    @POST("api/v1/config/payment-gateways")
    suspend fun getPaymentGateways(@Body body: Map<String, String>): PaymentGatewayListResponseDto

    // ── Vouchers / Coupons ──────────────────────────────────────────────
    @POST("api/v1/customer/vouchers")
    suspend fun getVouchers(@Body body: Map<String, String>): VoucherListResponseDto

    @POST("api/v1/customer/coupon")
    suspend fun applyCoupon(@Body body: Map<String, String>): ApplyCouponResponseDto
}
