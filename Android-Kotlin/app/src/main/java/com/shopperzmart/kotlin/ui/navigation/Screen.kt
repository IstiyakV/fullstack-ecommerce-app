package com.shopperzmart.kotlin.ui.navigation

sealed class Screen(val route: String) {
    object Splash         : Screen("splash")
    object Login          : Screen("login")
    object Register       : Screen("register")
    object OTP            : Screen("otp/{phone}") {
        fun createRoute(phone: String) = "otp/$phone"
    }
    object ForgotPassword : Screen("forgot_password")
    object Main           : Screen("main")
    object ProductDetail  : Screen("product/{productId}") {
        fun createRoute(id: String) = "product/$id"
    }
    object ProductList    : Screen("products?filter={filter}") {
        fun createRoute(filter: String = "") = "products?filter=$filter"
    }
    object WholesaleList  : Screen("wholesale_list")
    object Cart           : Screen("cart")
    object Checkout       : Screen("checkout")
    object OrderHistory   : Screen("orders")
    object OrderDetail    : Screen("order/{orderId}") {
        fun createRoute(id: String) = "order/$id"
    }
    object OrderTracking  : Screen("order_tracking/{orderId}") {
        fun createRoute(id: String) = "order_tracking/$id"
    }
    object Search         : Screen("search")
    object Notifications  : Screen("notifications")
    object Profile        : Screen("profile")
    object AddAddress     : Screen("add_address")
    object AddressList    : Screen("address_list")
    object Wishlist       : Screen("wishlist")
    object ProfileEdit    : Screen("profile_edit")
}
