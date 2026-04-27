package com.shopperzmart.kotlin.ui.screens.home

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.domain.model.*
import com.shopperzmart.kotlin.ui.common.ShimmerHomeFeed
import com.shopperzmart.kotlin.ui.screens.home.components.*
import com.shopperzmart.kotlin.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onProductClick: (String) -> Unit,
    onSearchClick: () -> Unit,
    onCartClick: () -> Unit,
    onNotificationsClick: () -> Unit,
    onViewAllClick: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val recentlyViewed by viewModel.recentlyViewed.collectAsState(initial = emptyList())

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = { HomeTopBar(onSearchClick, onCartClick, onNotificationsClick) },
    ) { padding ->
        when (val s = state) {
            is HomeUiState.Loading -> ShimmerHomeFeed()
            is HomeUiState.Error   -> ErrorState(message = s.message, onRetry = viewModel::loadHome)
            is HomeUiState.Success -> HomeFeedContent(
                feed             = s.feed,
                onProductClick   = onProductClick,
                onViewAllClick   = onViewAllClick,
                recentlyViewed   = recentlyViewed,
                modifier         = Modifier.padding(padding),
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HomeTopBar(
    onSearchClick: () -> Unit,
    onCartClick: () -> Unit,
    onNotificationsClick: () -> Unit,
) {
    TopAppBar(
        title = {
            Text(
                "Shopperz Mart",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.ExtraBold,
                    color      = Orange500,
                ),
            )
        },
        actions = {
            IconButton(onClick = onSearchClick) {
                Icon(Icons.Default.Search, "Search", tint = MaterialTheme.colorScheme.onSurface)
            }
            IconButton(onClick = onNotificationsClick) {
                Icon(Icons.Default.Notifications, "Notifications", tint = MaterialTheme.colorScheme.onSurface)
            }
            IconButton(onClick = onCartClick) {
                Icon(Icons.Default.ShoppingCart, "Cart", tint = Orange500)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface),
    )
}

@Composable
private fun HomeFeedContent(
    feed: HomeFeed,
    onProductClick: (String) -> Unit,
    onViewAllClick: (String) -> Unit,
    recentlyViewed: List<com.shopperzmart.kotlin.data.local.entity.RecentlyViewedEntity> = emptyList(),
    modifier: Modifier = Modifier,
) {
    // Pre-compute "Just For You" shuffled list (must be in @Composable scope)
    val justForYou = remember(feed) {
        (feed.newArrivals + feed.hotDeals + feed.gadgets + feed.popularProducts)
            .distinctBy { it.productId }
            .shuffled()
            .take(10)
    }

    LazyColumn(
        modifier            = modifier.fillMaxSize(),
        contentPadding      = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp),
    ) {
        // ── 1. Hero Banner Slider ──────────────────────────────────────────
        if (feed.sliders.isNotEmpty()) {
            item {
                BannerSliderCompose(
                    sliders  = feed.sliders,
                    modifier = Modifier.fillMaxWidth().height(220.dp),
                )
            }
            item { Spacer(Modifier.height(12.dp)) }
        }

        // ── 2. Top Categories ──────────────────────────────────────────────
        if (feed.topCategories.isNotEmpty()) {
            item {
                SectionHeader(title = "Top Categories", onViewAll = { onViewAllClick("categories") })
                Spacer(Modifier.height(8.dp))
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(feed.topCategories) { cat ->
                        CategoryChip(
                            category = cat,
                            onClick  = { onViewAllClick("cat_${cat.parentCategoryId}") },
                        )
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }

        // ── 3. New Arrivals ────────────────────────────────────────────────
        if (feed.newArrivals.isNotEmpty()) {
            item {
                SectionHeader(title = "New Arrivals 🆕", onViewAll = { onViewAllClick("new_arrivals") })
                Spacer(Modifier.height(8.dp))
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(feed.newArrivals) { p ->
                        ProductCard(product = p, onClick = { onProductClick(p.productId) })
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }

        // ── 4. Flash Sale / Hot Deals (countdown timer) ─────────────────────
        if (feed.hotDeals.isNotEmpty()) {
            item {
                FlashSaleHeader(onViewAllClick = { onViewAllClick("hot_deals") })
                Spacer(Modifier.height(8.dp))
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(feed.hotDeals) { p ->
                        ProductCard(product = p, onClick = { onProductClick(p.productId) })
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }

        // ── 5. Full Banner ─────────────────────────────────────────────────
        if (feed.fullSlider.isNotEmpty()) {
            item {
                AsyncImage(
                    model              = feed.fullSlider[0].sliderMobileImage,
                    contentDescription = feed.fullSlider[0].sliderTitle,
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(16.dp)),
                )
                Spacer(Modifier.height(14.dp))
            }
        }

        // ── 6. Gadgets grid ────────────────────────────────────────────────
        if (feed.gadgets.isNotEmpty()) {
            item {
                SectionHeader(title = "Gadgets & Tech 💻", onViewAll = { onViewAllClick("gadgets") })
                Spacer(Modifier.height(8.dp))
            }
            items(feed.gadgets.chunked(3)) { row ->
                Row(
                    modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    row.forEach { p ->
                        ProductCardGrid(
                            product  = p,
                            onClick  = { onProductClick(p.productId) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                }
                Spacer(Modifier.height(8.dp))
            }
            item { Spacer(Modifier.height(12.dp)) }
        }

        // ── 7. Half Banners ────────────────────────────────────────────────
        if (feed.halfSlider.size >= 2) {
            item {
                Row(
                    modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    AsyncImage(
                        model = feed.halfSlider[0].sliderMobileImage, contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.weight(1f).height(120.dp).clip(RoundedCornerShape(12.dp)),
                    )
                    AsyncImage(
                        model = feed.halfSlider[1].sliderMobileImage, contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.weight(1f).height(120.dp).clip(RoundedCornerShape(12.dp)),
                    )
                }
                Spacer(Modifier.height(14.dp))
            }
        }

        // ── 8. All Categories grid ─────────────────────────────────────────
        if (feed.categories.isNotEmpty()) {
            item {
                SectionHeader(title = "Browse Categories", onViewAll = { onViewAllClick("categories") })
                Spacer(Modifier.height(8.dp))
            }
            items(feed.categories.chunked(3)) { row ->
                Row(
                    modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    row.forEach { c ->
                        CategoryCardGrid(
                            category = c,
                            onClick  = { onViewAllClick("cat_${c.parentCategoryId}") },
                            modifier = Modifier.weight(1f).aspectRatio(1f),
                        )
                    }
                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                }
                Spacer(Modifier.height(8.dp))
            }
            item { Spacer(Modifier.height(12.dp)) }
        }

        // ── 9. Brand Row (circular logos) ─────────────────────────────────
        if (feed.brands.isNotEmpty()) {
            item {
                SectionHeader(title = "🏷️ Top Brands")
                Spacer(Modifier.height(8.dp))
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    items(feed.brands) { brand ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.width(72.dp),
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(CircleShape)
                                    .border(
                                        width = 2.dp,
                                        brush = Brush.linearGradient(listOf(Orange400, Orange600)),
                                        shape = CircleShape,
                                    )
                                    .background(
                                        MaterialTheme.colorScheme.surface,
                                        CircleShape,
                                    ),
                                contentAlignment = Alignment.Center,
                            ) {
                                AsyncImage(
                                    model = brand.brandImage,
                                    contentDescription = brand.categoryNameEn,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(58.dp)
                                        .clip(CircleShape),
                                )
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(
                                brand.categoryNameEn,
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                color = MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                }
                Spacer(Modifier.height(14.dp))
            }
        }

        // ── 10. Popular Products ────────────────────────────────────────────
        if (feed.popularProducts.isNotEmpty()) {
            item {
                SectionHeader(title = "⭐ Popular Products", onViewAll = { onViewAllClick("popular") })
                Spacer(Modifier.height(8.dp))
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(feed.popularProducts) { p ->
                        ProductCard(product = p, onClick = { onProductClick(p.productId) })
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }

        // ── 11. Recently Viewed ─────────────────────────────────────────
        if (recentlyViewed.isNotEmpty()) {
            item {
                SectionHeader(title = "📱 Recently Viewed")
                Spacer(Modifier.height(8.dp))
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(recentlyViewed) { rv ->
                        val product = Product(
                            productId = rv.productId, productName = rv.productName,
                            sellingPrice = rv.sellingPrice, regularPrice = rv.sellingPrice,
                            discountRate = "0", featuredImage = rv.image,
                            image = rv.image, stock = "1", productType = "retail",
                            categoryId = "", categoryNameEn = "", shopId = "",
                            shopName = "", deliveryCharge = "0", productRating = "0",
                            shopRating = "0", productDetails = "", productSpecification = "",
                            isActive = "1", isWholeSales = "0", stockStatus = "in_stock",
                            minimumOrderQuantity = "1",
                        )
                        ProductCard(product = product, onClick = { onProductClick(rv.productId) })
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }

        // ── 12. Just For You (shuffled discovery section) ───────────────
        if (justForYou.isNotEmpty()) {
            item {
                SectionHeader(title = "✨ Just For You")
                Spacer(Modifier.height(8.dp))
            }
            items(justForYou.chunked(2)) { row ->
                Row(
                    modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    row.forEach { p ->
                        ProductCardGrid(
                            product  = p,
                            onClick  = { onProductClick(p.productId) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (row.size < 2) Spacer(Modifier.weight(1f))
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Icon(Icons.Default.WifiOff, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.error)
            Text("Connection Failed", style = MaterialTheme.typography.titleMedium)
            Text(message, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = Orange500)) {
                Text("Try Again")
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Flash Sale Header with Countdown Timer
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun FlashSaleHeader(onViewAllClick: () -> Unit) {
    // Calculate remaining time until midnight (resets daily)
    var remainingSeconds by remember {
        val now = java.util.Calendar.getInstance()
        val midnight = java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.HOUR_OF_DAY, 23)
            set(java.util.Calendar.MINUTE, 59)
            set(java.util.Calendar.SECOND, 59)
        }
        val diff = ((midnight.timeInMillis - now.timeInMillis) / 1000).coerceAtLeast(0)
        mutableLongStateOf(diff)
    }

    LaunchedEffect(Unit) {
        while (remainingSeconds > 0) {
            kotlinx.coroutines.delay(1000)
            remainingSeconds--
        }
    }

    val hours = (remainingSeconds / 3600).toInt()
    val minutes = ((remainingSeconds % 3600) / 60).toInt()
    val seconds = (remainingSeconds % 60).toInt()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brush.horizontalGradient(listOf(Color(0xFFFF6B35), Orange500, Color(0xFFFF4500))))
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Left: Flash Sale label
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("⚡", fontSize = 18.sp)
                    Spacer(Modifier.width(6.dp))
                    Text(
                        "Flash Sale",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                        ),
                    )
                }
                Text(
                    "Ends in",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White.copy(alpha = 0.8f),
                )
            }

            Spacer(Modifier.weight(1f))

            // Center: Countdown timer boxes
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                CountdownBox(String.format("%02d", hours))
                Text(":", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                CountdownBox(String.format("%02d", minutes))
                Text(":", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                CountdownBox(String.format("%02d", seconds))
            }

            Spacer(Modifier.width(12.dp))

            // Right: View All
            TextButton(onClick = onViewAllClick) {
                Text("View All →", color = Color.White, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun CountdownBox(value: String) {
    Box(
        modifier = Modifier
            .size(36.dp)
            .background(Color.Black.copy(alpha = 0.3f), RoundedCornerShape(6.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = value,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp,
        )
    }
}
