package com.shopperzmart.kotlin.ui.navigation

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.shopperzmart.kotlin.ui.screens.address.AddAddressScreen
import com.shopperzmart.kotlin.ui.screens.address.AddressListScreen
import com.shopperzmart.kotlin.ui.screens.auth.forgot.ForgotPasswordScreen
import com.shopperzmart.kotlin.ui.screens.auth.login.LoginScreen
import com.shopperzmart.kotlin.ui.screens.auth.otp.OtpScreen
import com.shopperzmart.kotlin.ui.screens.auth.register.RegisterScreen
import com.shopperzmart.kotlin.ui.screens.cart.CartScreen
import com.shopperzmart.kotlin.ui.screens.checkout.CheckoutScreen
import com.shopperzmart.kotlin.ui.screens.main.MainScreen
import com.shopperzmart.kotlin.ui.screens.notifications.NotificationsScreen
import com.shopperzmart.kotlin.ui.screens.orders.OrderHistoryScreen
import com.shopperzmart.kotlin.ui.screens.orders.OrderDetailScreen
import com.shopperzmart.kotlin.ui.screens.orders.OrderTrackingScreen
import com.shopperzmart.kotlin.ui.screens.product_detail.ProductDetailScreen
import com.shopperzmart.kotlin.ui.screens.product_list.ProductListScreen
import com.shopperzmart.kotlin.ui.screens.profile.ProfileEditScreen
import com.shopperzmart.kotlin.ui.screens.search.SearchScreen
import com.shopperzmart.kotlin.ui.screens.splash.SplashScreen
import com.shopperzmart.kotlin.ui.screens.wishlist.WishlistScreen
import com.shopperzmart.kotlin.core.network.ConnectivityObserver
import com.shopperzmart.kotlin.ui.common.OfflineBanner

@Composable
fun AppNavigation(connectivityObserver: ConnectivityObserver) {
    val navController = rememberNavController()

    Column {
        OfflineBanner(connectivityObserver)

        NavHost(
            navController    = navController,
            startDestination = Screen.Splash.route,
            modifier         = Modifier.weight(1f),
        ) {

        // ── Splash ──────────────────────────────────────────────────────────
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToMain = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // ── Login (shown on demand) ─────────────────────────────────────────
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess       = { navController.popBackStack() },  // return to where user came from
                onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                onNavigateToForgot   = { navController.navigate(Screen.ForgotPassword.route) },
            )
        }

        // ── Register ────────────────────────────────────────────────────────
        composable(Screen.Register.route) {
            RegisterScreen(
                onRegistered   = { phone -> navController.navigate(Screen.OTP.createRoute(phone)) },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        // ── OTP ─────────────────────────────────────────────────────────────
        composable(
            route     = Screen.OTP.route,
            arguments = listOf(navArgument("phone") { type = NavType.StringType }),
        ) { backStack ->
            val phone = backStack.arguments?.getString("phone") ?: ""
            OtpScreen(
                phone          = phone,
                onVerified     = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        // ── Forgot Password ─────────────────────────────────────────────────
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onNavigateBack  = { navController.popBackStack() },
                onPasswordReset = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.ForgotPassword.route) { inclusive = true }
                    }
                },
            )
        }

        // ── Main (Home + bottom nav) — no auth required ─────────────────────
        composable(Screen.Main.route) {
            MainScreen(
                onNavigateToProduct        = { id -> navController.navigate(Screen.ProductDetail.createRoute(id)) },
                onNavigateToSearch         = { navController.navigate(Screen.Search.route) },
                onNavigateToCart           = { navController.navigate(Screen.Cart.route) },
                onNavigateToNotifications  = { navController.navigate(Screen.Notifications.route) },
                onNavigateToProductList    = { filter -> navController.navigate(Screen.ProductList.createRoute(filter)) },
                // Profile tab "Login" button or orders CTA
                onNavigateToLogin          = { navController.navigate(Screen.Login.route) },
                onNavigateToOrders         = { navController.navigate(Screen.OrderHistory.route) },
                onNavigateToAddress        = { navController.navigate(Screen.AddressList.route) },
                onNavigateToWishlist       = { navController.navigate(Screen.Wishlist.route) },
                onNavigateToProfileEdit    = { navController.navigate(Screen.ProfileEdit.route) },
            )
        }

        // ── Product Detail ──────────────────────────────────────────────────
        composable(
            route     = Screen.ProductDetail.route,
            arguments = listOf(navArgument("productId") { type = NavType.StringType }),
        ) { backStack ->
            val productId = backStack.arguments?.getString("productId") ?: ""
            ProductDetailScreen(
                productId      = productId,
                onNavigateBack = { navController.popBackStack() },
                onCartClicked  = { navController.navigate(Screen.Cart.route) },
                onProductClick = { id -> navController.navigate(Screen.ProductDetail.createRoute(id)) },
            )
        }

        // ── Product List (filtered) ─────────────────────────────────────────
        composable(
            route     = Screen.ProductList.route,
            arguments = listOf(navArgument("filter") { type = NavType.StringType; defaultValue = "" }),
        ) { backStack ->
            val filter = backStack.arguments?.getString("filter") ?: ""
            ProductListScreen(
                filter         = filter,
                onProductClick = { id -> navController.navigate(Screen.ProductDetail.createRoute(id)) },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        // ── Cart (browsing without login is allowed) ────────────────────────
        composable(Screen.Cart.route) {
            CartScreen(
                onNavigateBack = { navController.popBackStack() },
                onCheckout     = { navController.navigate(Screen.Checkout.route) },
                onNeedLogin    = { navController.navigate(Screen.Login.route) },
                onProductClick = { id -> navController.navigate(Screen.ProductDetail.createRoute(id)) },
            )
        }

        // ── Checkout (login required — gated in CartScreen) ─────────────────
        composable(Screen.Checkout.route) {
            CheckoutScreen(
                onNavigateBack = { navController.popBackStack() },
                onOrderPlaced  = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Main.route) { inclusive = false }
                    }
                },
                onAddAddressClick = { navController.navigate(Screen.AddAddress.route) }
            )
        }

        // ── Search ──────────────────────────────────────────────────────────
        composable(Screen.Search.route) {
            SearchScreen(
                onProductClick = { id -> navController.navigate(Screen.ProductDetail.createRoute(id)) },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        // ── Order History (login required) ──────────────────────────────────
        composable(Screen.OrderHistory.route) {
            OrderHistoryScreen(
                onNavigateBack = { navController.popBackStack() },
                onOrderClick = { orderId -> navController.navigate(Screen.OrderDetail.createRoute(orderId)) },
            )
        }

        // ── Order Detail ────────────────────────────────────────────────
        composable(
            route     = Screen.OrderDetail.route,
            arguments = listOf(navArgument("orderId") { type = NavType.StringType }),
        ) { backStack ->
            val oId = backStack.arguments?.getString("orderId") ?: ""
            OrderDetailScreen(
                orderId = oId,
                onNavigateBack = { navController.popBackStack() },
                onTrackOrder = { navController.navigate(Screen.OrderTracking.createRoute(oId)) },
            )
        }

        // ── Order Tracking ──────────────────────────────────────────────
        composable(
            route     = Screen.OrderTracking.route,
            arguments = listOf(navArgument("orderId") { type = NavType.StringType }),
        ) { backStack ->
            val oId = backStack.arguments?.getString("orderId") ?: ""
            OrderTrackingScreen(
                orderId = oId,
                onNavigateBack = { navController.popBackStack() },
            )
        }

        // ── Wishlist ────────────────────────────────────────────────────────
        composable(Screen.Wishlist.route) {
            WishlistScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                onProductClick = { id -> navController.navigate(Screen.ProductDetail.createRoute(id)) },
            )
        }

        // ── Notifications ───────────────────────────────────────────────────
        composable(Screen.Notifications.route) {
            NotificationsScreen(onNavigateBack = { navController.popBackStack() })
        }

        // ── Add Address ─────────────────────────────────────────────────────
        composable(Screen.AddAddress.route) {
            AddAddressScreen(onNavigateBack = { navController.popBackStack() })
        }

        // ── Address List ────────────────────────────────────────────────────
        composable(Screen.AddressList.route) {
            AddressListScreen(
                onNavigateBack = { navController.popBackStack() },
                onAddAddress   = { navController.navigate(Screen.AddAddress.route) },
            )
        }

        // ── Profile Edit ────────────────────────────────────────────────
        composable(Screen.ProfileEdit.route) {
            ProfileEditScreen(onNavigateBack = { navController.popBackStack() })
        }
        }
    }
}
