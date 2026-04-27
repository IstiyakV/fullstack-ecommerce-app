package com.shopperzmart.kotlin.domain.usecase

import com.shopperzmart.kotlin.domain.repository.HomeRepository
import javax.inject.Inject

class GetHomeFeedUseCase @Inject constructor(
    private val repository: HomeRepository
) {
    suspend operator fun invoke() = repository.getHomeFeed()
}

// ─────────────────────────────────────────────
class LoginUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AuthRepository
) {
    suspend operator fun invoke(phone: String, password: String) =
        repository.login(phone, password)
}

class RegisterUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AuthRepository
) {
    suspend operator fun invoke(name: String, phone: String, password: String) =
        repository.register(name, phone, password)
}

class LogoutUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AuthRepository
) {
    suspend operator fun invoke() = repository.logout()
}

class GoogleSignInUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AuthRepository
) {
    suspend operator fun invoke(idToken: String) = repository.googleLogin(idToken)
}

class UpdateProfileUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AuthRepository
) {
    suspend operator fun invoke(name: String, email: String, phone: String) =
        repository.updateProfile(name, email, phone)
}

// ─────────────────────────────────────────────
class GetProductDetailsUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ProductRepository
) {
    suspend operator fun invoke(productId: String) =
        repository.getProductDetails(productId)
}

class FilterProductsUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ProductRepository
) {
    suspend operator fun invoke(filters: Map<String, String>) =
        repository.filterProducts(filters)
}

class WriteReviewUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ProductRepository
) {
    suspend operator fun invoke(productId: String, rating: Int, title: String, comment: String) =
        repository.writeReview(productId, rating, title, comment)
}

// ─────────────────────────────────────────────
class AddToCartUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.CartRepository
) {
    suspend operator fun invoke(item: com.shopperzmart.kotlin.domain.model.CartItem) =
        repository.addToCart(item)
}

class GetCartUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.CartRepository
) {
    operator fun invoke() = repository.getCartItems()
}

class UpdateCartQuantityUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.CartRepository
) {
    suspend operator fun invoke(productId: String, qty: Int) =
        repository.updateQuantity(productId, qty)
}

class RemoveFromCartUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.CartRepository
) {
    suspend operator fun invoke(productId: String) =
        repository.removeFromCart(productId)
}

class ClearCartUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.CartRepository
) {
    suspend operator fun invoke() = repository.clearCart()
}

// ─────────────────────────────────────────────
class ToggleWishlistUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.WishlistRepository
) {
    suspend operator fun invoke(item: com.shopperzmart.kotlin.data.local.entity.WishlistEntity) =
        repository.toggleWishlist(item)
}

class GetWishlistUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.WishlistRepository
) {
    operator fun invoke() = repository.getWishlistItems()
}

class CheckWishlistUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.WishlistRepository
) {
    operator fun invoke(productId: String) = repository.checkExists(productId)
}

class RemoveFromWishlistUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.WishlistRepository
) {
    suspend operator fun invoke(productId: String) = repository.remove(productId)
}

// ─────────────────────────────────────────────
class PlaceOrderUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.OrderRepository
) {
    suspend operator fun invoke(payload: Map<String, Any>) = repository.placeOrder(payload)
}

class GetOrdersUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.OrderRepository
) {
    suspend operator fun invoke(userKey: String) = repository.getOrders(userKey)
}

class GetOrderDetailUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.OrderRepository
) {
    suspend operator fun invoke(orderId: String) = repository.getOrderDetails(orderId)
}

class CancelOrderUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.OrderRepository
) {
    suspend operator fun invoke(orderId: String) = repository.cancelOrder(orderId)
}

// ─────────────────────────────────────────────
class GetAddressesUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AddressRepository
) {
    suspend operator fun invoke(userKey: String) = repository.getAddresses(userKey)
}

class SaveAddressUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AddressRepository
) {
    suspend operator fun invoke(body: Map<String, String>) = repository.saveAddress(body)
}

class DeleteAddressUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.AddressRepository
) {
    suspend operator fun invoke(addressId: String) = repository.deleteAddress(addressId)
}

// ─────────────────────────────────────────────
class GetCitiesUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ConfigRepository
) {
    suspend operator fun invoke() = repository.getCities()
}

class GetShippingZoneForCityUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ConfigRepository
) {
    suspend operator fun invoke(cityId: String) = repository.getShippingZoneForCity(cityId)
}

class GetAppConfigUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ConfigRepository
) {
    suspend operator fun invoke() = repository.getAppConfig()
}

class GetPaymentGatewaysUseCase @Inject constructor(
    private val repository: com.shopperzmart.kotlin.domain.repository.ConfigRepository
) {
    suspend operator fun invoke() = repository.getPaymentGateways()
}

