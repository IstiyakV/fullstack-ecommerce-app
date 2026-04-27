package com.shopperzmart.kotlin.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.shopperzmart.kotlin.ui.screens.categories.CategoriesScreen
import com.shopperzmart.kotlin.ui.screens.home.HomeScreen
import com.shopperzmart.kotlin.ui.screens.offers.OffersScreen
import com.shopperzmart.kotlin.ui.screens.profile.ProfileScreen
import com.shopperzmart.kotlin.ui.theme.Orange500

private data class BottomNavItem(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
)

private val navItems = listOf(
    BottomNavItem("Home",       Icons.Filled.Home,     Icons.Outlined.Home),
    BottomNavItem("Categories", Icons.Filled.GridView,  Icons.Outlined.GridView),
    BottomNavItem("Offers",     Icons.Filled.LocalOffer, Icons.Outlined.LocalOffer),
    BottomNavItem("Profile",    Icons.Filled.Person,   Icons.Outlined.Person),
)

@Composable
fun MainScreen(
    onNavigateToProduct: (String) -> Unit,
    onNavigateToSearch: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToProductList: (String) -> Unit,
    onNavigateToLogin: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToAddress: () -> Unit,
    onNavigateToWishlist: () -> Unit,
    onNavigateToProfileEdit: () -> Unit = {},
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp,
            ) {
                navItems.forEachIndexed { index, item ->
                    NavigationBarItem(
                        selected  = selectedTab == index,
                        onClick   = { selectedTab = index },
                        icon      = {
                            Icon(
                                imageVector        = if (selectedTab == index) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.label,
                            )
                        },
                        label     = { Text(item.label) },
                        colors    = NavigationBarItemDefaults.colors(
                            selectedIconColor   = Orange500,
                            selectedTextColor   = Orange500,
                            indicatorColor      = Orange500.copy(alpha = 0.12f),
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        ),
                    )
                }
            }
        }
    ) { innerPadding ->
        // Simple when-switch — avoids AnimatedContent API compatibility issues
        Box(modifier = Modifier.padding(innerPadding)) {
            when (selectedTab) {
                0 -> HomeScreen(
                    onProductClick       = onNavigateToProduct,
                    onSearchClick        = onNavigateToSearch,
                    onCartClick          = onNavigateToCart,
                    onNotificationsClick = onNavigateToNotifications,
                    onViewAllClick       = { filter ->
                        if (filter == "categories") selectedTab = 1
                        else onNavigateToProductList(filter)
                    },
                )
                1 -> CategoriesScreen(
                    onProductClick  = onNavigateToProduct,
                    onCategoryClick = onNavigateToProductList,
                )
                2 -> OffersScreen(
                    onProductClick = onNavigateToProduct,
                )
                3 -> ProfileScreen(
                    onLoginClick   = onNavigateToLogin,
                    onOrdersClick  = onNavigateToOrders,
                    onAddressClick = onNavigateToAddress,
                    onWishlistClick = onNavigateToWishlist,
                    onEditProfileClick = onNavigateToProfileEdit,
                )
            }
        }
    }
}
