package com.shopperzmart.kotlin.ui.screens.product_detail

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.*
import com.shopperzmart.kotlin.domain.repository.ProductDetailResult
import com.shopperzmart.kotlin.domain.usecase.AddToCartUseCase
import com.shopperzmart.kotlin.domain.usecase.GetProductDetailsUseCase
import com.shopperzmart.kotlin.domain.usecase.WriteReviewUseCase
import com.shopperzmart.kotlin.domain.usecase.CheckWishlistUseCase
import com.shopperzmart.kotlin.domain.usecase.ToggleWishlistUseCase
import com.shopperzmart.kotlin.data.local.entity.WishlistEntity
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ═══════════════════════════════════════════════════════════════════════
// State + ViewModel
// ═══════════════════════════════════════════════════════════════════════

sealed class PDState {
    object Loading : PDState()
    data class Success(
        val product: Product,
        val images: List<String>,
        val relatedProducts: List<Product>,
        val reviews: List<Review>,
        val variantTypes: List<VariantType>,
        val skus: List<ProductSku>,
        val reviewSummary: ReviewSummary?,
    ) : PDState()
    data class Error(val msg: String) : PDState()
}

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val getDetails: GetProductDetailsUseCase,
    private val addToCart: AddToCartUseCase,
    private val checkWishlist: CheckWishlistUseCase,
    private val toggleWishlistUseCase: ToggleWishlistUseCase,
    private val writeReviewUseCase: WriteReviewUseCase,
    private val recentlyViewedDao: com.shopperzmart.kotlin.data.local.dao.RecentlyViewedDao,
) : ViewModel() {
    val state = MutableStateFlow<PDState>(PDState.Loading)
    // Temporary toast message — auto-clears after 2.5s
    val cartToastMessage = MutableStateFlow<String?>(null)
    val isWishlisted = MutableStateFlow(false)
    var reviewSubmitted by mutableStateOf(false)
    var reviewSubmitting by mutableStateOf(false)

    // ── Variant state ────────────────────────────────────────────────
    val selectedOptions = mutableStateMapOf<String, SelectedVariant>()
    val matchedSku = MutableStateFlow<ProductSku?>(null)
    val displayImages = MutableStateFlow<List<String>>(emptyList())
    var quantity by mutableIntStateOf(1)

    private var currentProductId: String = ""
    private var originalImages: List<String> = emptyList()

    fun load(id: String) = viewModelScope.launch {
        currentProductId = id
        state.value = PDState.Loading
        val result = getDetails(id)
        when (result) {
            is Result.Success -> {
                if (result.data != null) {
                    viewModelScope.launch {
                        checkWishlist(id).collect { isWishlisted.value = it }
                    }
                    // Track recently viewed
                    viewModelScope.launch {
                        recentlyViewedDao.upsert(
                            com.shopperzmart.kotlin.data.local.entity.RecentlyViewedEntity(
                                productId = result.data.product.productId,
                                productName = result.data.product.productName,
                                sellingPrice = result.data.product.sellingPrice,
                                image = result.data.product.featuredImage,
                            )
                        )
                        recentlyViewedDao.trimOld()
                    }
                    // Init images
                    originalImages = result.data.images
                    displayImages.value = result.data.images
                    // SET STATE FIRST so matchSku() can read skus from state
                    state.value = PDState.Success(
                        result.data.product, result.data.images, result.data.relatedProducts,
                        result.data.reviews, result.data.variantTypes, result.data.skus, result.data.reviewSummary,
                    )
                    // NOW init variant defaults + match SKU (state is already Success)
                    initVariantDefaults(result.data.variantTypes)
                } else {
                    state.value = PDState.Error("Product not found")
                }
            }
            is Result.Error -> state.value = PDState.Error(result.message)
            else -> state.value = PDState.Loading
        }
    }

    private fun initVariantDefaults(variantTypes: List<VariantType>) {
        selectedOptions.clear()
        quantity = 1
        var firstGallery: List<String>? = null
        var firstOptionImage: String? = null
        variantTypes.forEach { vt ->
            if (vt.options.isNotEmpty()) {
                val defaultOpt = vt.options.find { it.isDefault } ?: vt.options[0]
                selectedOptions[vt.typeName] = SelectedVariant(
                    value = defaultOpt.optionValue,
                    image = defaultOpt.optionImage,
                )
                if (firstGallery == null && defaultOpt.galleryImages.isNotEmpty()) {
                    firstGallery = defaultOpt.galleryImages
                }
                if (firstOptionImage == null && defaultOpt.optionImage.isNotBlank()) {
                    firstOptionImage = defaultOpt.optionImage
                }
            }
        }
        // Swap gallery: prefer variant gallery, otherwise replace hero with option thumbnail
        if (firstGallery != null) {
            displayImages.value = firstGallery!!
        } else if (firstOptionImage != null) {
            displayImages.value = listOf(firstOptionImage!!) + originalImages.drop(1)
        }
        // Trigger SKU match
        matchSku()
    }

    fun selectVariant(typeName: String, option: VariantOption) {
        selectedOptions[typeName] = SelectedVariant(
            value = option.optionValue,
            image = option.optionImage,
        )
        // Only swap gallery if this variant option has dedicated gallery images
        // (avoids Size/Storage overwriting the Color gallery with a generic thumbnail)
        if (option.galleryImages.isNotEmpty()) {
            displayImages.value = option.galleryImages
        }
        matchSku()
    }

    private fun matchSku() {
        val s = state.value
        if (s !is PDState.Success || s.skus.isEmpty()) {
            matchedSku.value = null
            return
        }
        val matched = s.skus.find { sku ->
            sku.isActive && selectedOptions.all { (type, sel) ->
                sku.combination[type] == sel.value
            }
        }
        matchedSku.value = matched
    }

    fun getDisplayPrice(product: Product): Double {
        return matchedSku.value?.price ?: product.sellingPrice
    }

    fun getDisplayRegularPrice(product: Product): Double {
        return matchedSku.value?.regularPrice ?: product.regularPrice
    }

    fun getDisplayStock(product: Product): Int {
        val s = state.value
        if (matchedSku.value != null) return matchedSku.value!!.stock
        if (s is PDState.Success && s.skus.isNotEmpty() && s.variantTypes.isNotEmpty()) return 0
        return product.stock.toIntOrNull() ?: 0
    }

    fun getDisplaySku(): String {
        return matchedSku.value?.skuCode ?: ""
    }

    fun toggleWishlist(product: Product) = viewModelScope.launch {
        toggleWishlistUseCase(WishlistEntity(
            productId = product.productId, productName = product.productName,
            sellingPrice = product.sellingPrice, image = product.featuredImage,
            shopName = product.shopName,
        ))
    }

    fun addProductToCart(product: Product) = viewModelScope.launch {
        // Guard: prevent adding if out of stock or no valid variant selected
        val stock = getDisplayStock(product)
        if (stock <= 0) return@launch
        if (selectedOptions.isNotEmpty() && matchedSku.value == null) return@launch

        val price = getDisplayPrice(product)
        val regularPrice = getDisplayRegularPrice(product)
        val variantLabel = if (selectedOptions.isNotEmpty()) {
            selectedOptions.entries.joinToString(", ") { "${it.key}: ${it.value.value}" }
        } else ""
        val displayName = if (variantLabel.isNotEmpty()) {
            "${product.productName} ($variantLabel)"
        } else product.productName

        // Use variant-specific image for cart thumbnail
        // displayImages is already swapped to the selected variant's gallery/optionImage
        val variantImage = displayImages.value.firstOrNull()?.takeIf { it.isNotBlank() }
            ?: product.featuredImage

        addToCart(CartItem(
            productId = product.productId + (matchedSku.value?.let { "-${it.skuCode}" } ?: ""),
            productName = displayName,
            image = variantImage, sellingPrice = price,
            regularPrice = regularPrice, quantity = quantity,
            shopName = product.shopName, deliveryCharge = product.deliveryCharge,
        ))
        // Show toast and auto-dismiss after 2.5s
        cartToastMessage.value = "${quantity}× added to cart"
        viewModelScope.launch {
            delay(2500)
            cartToastMessage.value = null
        }
    }

    fun submitReview(rating: Int, title: String, comment: String) = viewModelScope.launch {
        reviewSubmitting = true
        val result = writeReviewUseCase(
            productId = currentProductId,
            rating = rating,
            title = title,
            comment = comment,
        )
        reviewSubmitting = false
        if (result is Result.Success) {
            reviewSubmitted = true
            // Reload to get fresh reviews
            load(currentProductId)
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Screen
// ═══════════════════════════════════════════════════════════════════════

@Composable
fun ProductDetailScreen(
    productId: String,
    onNavigateBack: () -> Unit,
    onCartClicked: () -> Unit,
    onProductClick: (String) -> Unit,
    viewModel: ProductDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(productId) { viewModel.load(productId) }

    when (val s = state) {
        is PDState.Loading -> com.shopperzmart.kotlin.ui.common.ShimmerProductDetail()
        is PDState.Error -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.Error, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.error)
                Text(s.msg); Button(onClick = onNavigateBack) { Text("Go Back") }
            }
        }
        is PDState.Success -> ProductDetailContent(
            s.product, s.images, s.relatedProducts, s.reviews,
            s.variantTypes, s.skus, s.reviewSummary,
            viewModel, onNavigateBack, onCartClicked, onProductClick,
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Content
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
private fun ProductDetailContent(
    product: Product,
    images: List<String>,
    relatedProducts: List<Product>,
    reviews: List<Review>,
    variantTypes: List<VariantType>,
    skus: List<ProductSku>,
    reviewSummary: ReviewSummary?,
    viewModel: ProductDetailViewModel,
    onNavigateBack: () -> Unit,
    onCartClicked: () -> Unit,
    onProductClick: (String) -> Unit,
) {
    val cartToast by viewModel.cartToastMessage.collectAsState()
    val isWishlisted by viewModel.isWishlisted.collectAsState()
    val currentMatchedSku by viewModel.matchedSku.collectAsState()
    val galleryImages by viewModel.displayImages.collectAsState()
    val activeImages = galleryImages.ifEmpty { images }
    val displayPrice = viewModel.getDisplayPrice(product)
    val displayRegularPrice = viewModel.getDisplayRegularPrice(product)
    val displayStock = viewModel.getDisplayStock(product)
    val discount = if (displayRegularPrice > displayPrice) ((displayRegularPrice - displayPrice) / displayRegularPrice * 100).toInt() else 0
    val hasVariants = variantTypes.isNotEmpty()
    var showWriteReview by remember { mutableStateOf(false) }
    var showFullScreenGallery by remember { mutableStateOf(false) }
    var fullScreenInitialPage by remember { mutableIntStateOf(0) }

    // Add to Cart guard logic (never permanently locked)
    val canAddToCart = when {
        hasVariants && currentMatchedSku == null -> false
        displayStock <= 0 -> false
        else -> true
    }
    val addToCartLabel = when {
        hasVariants && currentMatchedSku == null -> "Select Variant"
        displayStock <= 0 -> "Out of Stock"
        else -> "Add to Cart"
    }

    // Full-screen gallery dialog
    if (showFullScreenGallery && activeImages.isNotEmpty()) {
        FullScreenGalleryDialog(
            images = activeImages,
            initialPage = fullScreenInitialPage,
            productName = product.productName,
            onDismiss = { showFullScreenGallery = false },
        )
    }

    // Write review dialog
    if (showWriteReview) {
        WriteReviewDialog(
            productName = product.productName,
            isSubmitting = viewModel.reviewSubmitting,
            onDismiss = { showWriteReview = false },
            onSubmit = { rating, title, comment ->
                viewModel.submitReview(rating, title, comment)
                showWriteReview = false
            },
        )
    }

    Scaffold(
        bottomBar = {
            Column {
                // ── Animated Cart Toast ──────────────────────────────────
                AnimatedVisibility(
                    visible = cartToast != null,
                    enter = slideInVertically(tween(300)) { it } + fadeIn(tween(300)),
                    exit = slideOutVertically(tween(300)) { it } + fadeOut(tween(300)),
                ) {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Success,
                        shadowElevation = 8.dp,
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            Icon(
                                Icons.Default.CheckCircle, null,
                                modifier = Modifier.size(22.dp),
                                tint = Color.White,
                            )
                            Text(
                                cartToast ?: "",
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.weight(1f),
                            )
                            TextButton(
                                onClick = onCartClicked,
                                colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                            ) {
                                Text("VIEW CART", fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                                Spacer(Modifier.width(4.dp))
                                Icon(Icons.Default.ArrowForward, null, Modifier.size(16.dp))
                            }
                        }
                    }
                }

                // ── Bottom Bar Buttons ───────────────────────────────────
                Surface(shadowElevation = 12.dp) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        OutlinedButton(
                            onClick = onCartClicked,
                            modifier = Modifier.weight(1f).height(52.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.5.dp, Orange500),
                        ) { Text("View Cart", color = Orange500, fontWeight = FontWeight.Bold) }

                        Button(
                            onClick = { if (canAddToCart) viewModel.addProductToCart(product) },
                            modifier = Modifier.weight(1f).height(52.dp),
                            shape = RoundedCornerShape(12.dp),
                            enabled = canAddToCart,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Orange500,
                                disabledContainerColor = Color.Gray.copy(alpha = 0.5f),
                            ),
                        ) {
                            Icon(
                                when {
                                    displayStock <= 0 -> Icons.Default.RemoveShoppingCart
                                    else -> Icons.Default.ShoppingCart
                                },
                                null, Modifier.size(18.dp),
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(addToCartLabel, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).verticalScroll(rememberScrollState())) {

            // ── Image Gallery with Pager ────────────────────────────────
            Box(modifier = Modifier.fillMaxWidth().height(380.dp)) {
                if (activeImages.isNotEmpty()) {
                    val pagerState = rememberPagerState(pageCount = { activeImages.size })

                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize(),
                        userScrollEnabled = true,
                    ) { page ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clickable {
                                    fullScreenInitialPage = page
                                    showFullScreenGallery = true
                                },
                        ) {
                            AsyncImage(
                                model = activeImages[page],
                                contentDescription = "${product.productName} image ${page + 1}",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.fillMaxSize(),
                            )
                        }
                    }

                    // Gradient overlay
                    Box(
                        modifier = Modifier.fillMaxSize()
                            .background(Brush.verticalGradient(listOf(Color.Transparent, GradientEnd.copy(alpha = 0.3f)), startY = 280f))
                    )

                    // Dot indicators
                    if (activeImages.size > 1) {
                        Row(
                            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            activeImages.forEachIndexed { idx, _ ->
                                Box(
                                    modifier = Modifier
                                        .size(if (idx == pagerState.currentPage) 10.dp else 7.dp)
                                        .clip(CircleShape)
                                        .background(
                                            if (idx == pagerState.currentPage) Orange500
                                            else Color.White.copy(alpha = 0.5f)
                                        )
                                )
                            }
                        }
                    }

                    // Image counter badge
                    if (activeImages.size > 1) {
                        Surface(
                            modifier = Modifier.align(Alignment.BottomEnd).padding(12.dp),
                            shape = RoundedCornerShape(8.dp),
                            color = Color.Black.copy(alpha = 0.6f),
                        ) {
                            Text(
                                "${pagerState.currentPage + 1}/${activeImages.size}",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold,
                            )
                        }
                    }

                    // Tap hint icon
                    Surface(
                        modifier = Modifier.align(Alignment.BottomStart).padding(12.dp),
                        shape = CircleShape,
                        color = Color.Black.copy(alpha = 0.4f),
                    ) {
                        Icon(
                            Icons.Default.ZoomIn, "View full screen",
                            modifier = Modifier.padding(6.dp).size(18.dp),
                            tint = Color.White,
                        )
                    }
                } else {
                    // Fallback single image
                    AsyncImage(
                        model = product.featuredImage,
                        contentDescription = product.productName,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.fillMaxSize().clickable {
                            fullScreenInitialPage = 0
                            showFullScreenGallery = true
                        },
                    )
                }

                // ── Top Overlay Actions ─────────────────────────────────
                Row(
                    modifier = Modifier.fillMaxWidth().padding(12.dp).align(Alignment.TopCenter),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top,
                ) {
                    // Back button
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.clip(CircleShape).background(Color.Black.copy(alpha = 0.5f)),
                    ) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Color.White) }

                    // Discount + Favorite
                    Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (discount > 0) {
                            Box(
                                modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(Orange500)
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) { Text("-$discount%", color = Color.White, fontWeight = FontWeight.Bold) }
                        }
                        IconButton(
                            onClick = { viewModel.toggleWishlist(product) },
                            modifier = Modifier.clip(CircleShape).background(Color.White.copy(alpha = 0.8f)).size(40.dp),
                        ) {
                            Icon(
                                if (isWishlisted) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Wishlist",
                                tint = if (isWishlisted) Color.Red else Color.Gray,
                                modifier = Modifier.size(24.dp),
                            )
                        }
                    }
                }
            }

            // ── Product Info ────────────────────────────────────────────
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(product.productName, style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold))

                // Price row
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("৳${displayPrice.toInt()}", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Orange500)
                    if (discount > 0) Text(
                        "৳${displayRegularPrice.toInt()}", fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant, textDecoration = TextDecoration.LineThrough
                    )
                    if (discount > 0) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Success.copy(alpha = 0.12f),
                        ) {
                            Text(
                                "Save ৳${(displayRegularPrice - displayPrice).toInt()}",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Success,
                            )
                        }
                    }
                }

                // SKU display
                val skuCode = viewModel.getDisplaySku()
                if (skuCode.isNotBlank()) {
                    Text("SKU: $skuCode", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                // Rating row
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    repeat(5) { i ->
                        Icon(
                            Icons.Default.Star, null, Modifier.size(16.dp),
                            tint = if (i < (product.productRating.toFloatOrNull()?.toInt() ?: 0)) StarYellow else MaterialTheme.colorScheme.outline,
                        )
                    }
                    Text("${product.productRating} • ${product.shopName}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                HorizontalDivider()

                // ── Variant Selectors ────────────────────────────────────
                if (hasVariants) {
                    VariantSelectorsSection(
                        variantTypes = variantTypes,
                        skus = skus,
                        selectedOptions = viewModel.selectedOptions,
                        matchedSku = currentMatchedSku,
                        product = product,
                        onSelectVariant = { typeName, option -> viewModel.selectVariant(typeName, option) },
                    )
                    HorizontalDivider()
                }

                // ── Quantity Selector ────────────────────────────────────
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Quantity", fontWeight = FontWeight.SemiBold)
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { if (viewModel.quantity > 1) viewModel.quantity-- },
                                modifier = Modifier.size(36.dp),
                                enabled = displayStock > 0,
                            ) { Icon(Icons.Default.Remove, null, Modifier.size(16.dp)) }
                            Text(
                                "${viewModel.quantity}",
                                modifier = Modifier.widthIn(min = 32.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                fontWeight = FontWeight.Bold,
                            )
                            IconButton(
                                onClick = { if (displayStock > 0 && viewModel.quantity < displayStock) viewModel.quantity++ },
                                modifier = Modifier.size(36.dp),
                                enabled = displayStock > 0 && viewModel.quantity < displayStock,
                            ) { Icon(Icons.Default.Add, null, Modifier.size(16.dp)) }
                        }
                    }
                    Text(
                        when {
                            displayStock > 0 -> "$displayStock available"
                            hasVariants && currentMatchedSku == null -> "Select variant"
                            else -> "Out of stock"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = when {
                            displayStock > 0 -> Success
                            else -> Error
                        },
                        fontWeight = FontWeight.SemiBold,
                    )
                }

                // Info chips
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InfoChip("Stock", if (hasVariants) displayStock.toString() else product.stock)
                    InfoChip("Delivery", "৳${product.deliveryCharge}")
                    InfoChip("Min. Qty", product.minimumOrderQuantity)
                }

                HorizontalDivider()

                // ── Tabbed Content (Description | Specs | Reviews) ──────
                var selectedTab by remember { mutableIntStateOf(0) }
                val tabTitles = listOf("Description", "Specs", "Reviews (${reviews.size})")

                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.Transparent,
                    contentColor = Orange500,
                    divider = {},
                ) {
                    tabTitles.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = {
                                Text(
                                    title,
                                    fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 13.sp,
                                )
                            },
                            selectedContentColor = Orange500,
                            unselectedContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }

                Spacer(Modifier.height(12.dp))

                // Tab content (rendered inline — no nested scroll)
                when (selectedTab) {
                    0 -> {
                        // Description tab
                        if (product.productDetails.isNotBlank()) {
                            HtmlText(
                                html = product.productDetails,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        } else {
                            Text(
                                "No description available for this product.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                            )
                        }
                    }
                    1 -> {
                        // Specifications tab
                        if (product.productSpecification.isNotBlank()) {
                            HtmlText(
                                html = product.productSpecification,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        } else {
                            Text(
                                "No specifications available.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                            )
                        }
                    }
                    2 -> {
                        // Reviews tab (inline)
                        ReviewsTabContent(
                            reviews = reviews,
                            onWriteReviewClick = { showWriteReview = true },
                        )
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // ── Delivery & Trust ────────────────────────────────────────
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                shape = RoundedCornerShape(14.dp),
                elevation = CardDefaults.cardElevation(1.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Delivery & Returns", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                    TrustRow(Icons.Default.LocalShipping, "Delivery", "৳${product.deliveryCharge} • Est. 2-4 days")
                    TrustRow(Icons.Default.AssignmentReturn, "Returns", "7 Day Easy Return Policy")
                    TrustRow(Icons.Default.VerifiedUser, "Guarantee", "100% Genuine Products")
                    TrustRow(Icons.Default.Lock, "Secure", "Safe & Secure Payments")
                }
            }

            Spacer(Modifier.height(8.dp))

            // ── Highlights ──────────────────────────────────────────────
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                shape = RoundedCornerShape(14.dp),
                elevation = CardDefaults.cardElevation(1.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Highlights", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                    HighlightRow("Brand", product.shopName)
                    HighlightRow("Category", product.categoryNameEn.ifBlank { "General" })
                    if (viewModel.getDisplaySku().isNotBlank()) HighlightRow("SKU", viewModel.getDisplaySku())
                    HighlightRow("Warranty", "Manufacturer Warranty")
                }
            }

            Spacer(Modifier.height(8.dp))

            // ── Related Products ────────────────────────────────────────
            if (relatedProducts.isNotEmpty()) {
                HorizontalDivider(Modifier.padding(horizontal = 20.dp))
                Column(Modifier.padding(top = 12.dp, bottom = 24.dp)) {
                    Text(
                        "Related Products",
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    )
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(relatedProducts, key = { it.productId }) { item ->
                            RelatedProductCard(
                                product = item,
                                onClick = { onProductClick(item.productId) },
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Reviews Tab Content (rendered inside Description|Specs|Reviews tab)
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun ReviewsTabContent(
    reviews: List<Review>,
    onWriteReviewClick: () -> Unit,
) {
    Column {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "Customer Reviews",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            )
            TextButton(onClick = onWriteReviewClick) {
                Icon(Icons.Default.RateReview, null, Modifier.size(18.dp), tint = Orange500)
                Spacer(Modifier.width(4.dp))
                Text("Write Review", color = Orange500, fontWeight = FontWeight.SemiBold)
            }
        }

        if (reviews.isEmpty()) {
            // Empty state
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Icon(
                        Icons.Default.Reviews, null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "No reviews yet",
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                    )
                    Text(
                        "Be the first to review this product!",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                    )
                }
            }
        } else {
            // Rating Summary Card
            val avgRating = reviews.map { it.rating }.average()
            val ratingCounts = (1..5).map { star -> reviews.count { it.rating == star } }

            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(20.dp),
                ) {
                    // Left: big average number
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(top = 4.dp),
                    ) {
                        Text(
                            String.format("%.1f", avgRating),
                            style = MaterialTheme.typography.displaySmall.copy(fontWeight = FontWeight.Bold),
                            color = Orange500,
                        )
                        Row {
                            repeat(5) { i ->
                                Icon(
                                    Icons.Default.Star, null, Modifier.size(14.dp),
                                    tint = if (i < avgRating.toInt()) StarYellow else MaterialTheme.colorScheme.outline,
                                )
                            }
                        }
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "${reviews.size} review${if (reviews.size != 1) "s" else ""}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }

                    // Right: rating breakdown bars
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        (5 downTo 1).forEach { star ->
                            val count = ratingCounts[star - 1]
                            val fraction = if (reviews.isNotEmpty()) count.toFloat() / reviews.size else 0f
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                            ) {
                                Text(
                                    "$star",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    modifier = Modifier.width(12.dp),
                                )
                                Icon(Icons.Default.Star, null, Modifier.size(12.dp), tint = StarYellow)
                                LinearProgressIndicator(
                                    progress = { fraction },
                                    modifier = Modifier.weight(1f).height(8.dp).clip(RoundedCornerShape(4.dp)),
                                    color = when (star) {
                                        5 -> Success
                                        4 -> Color(0xFF84CC16)
                                        3 -> Warning
                                        2 -> Orange500
                                        else -> Error
                                    },
                                    trackColor = MaterialTheme.colorScheme.surfaceVariant,
                                )
                                Text(
                                    "$count",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.width(20.dp),
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // Individual review cards
            reviews.forEach { review ->
                ReviewCard(review = review)
                Spacer(Modifier.height(10.dp))
            }
        }

        Spacer(Modifier.height(12.dp))
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Review Card
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun ReviewCard(review: Review) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            // Header: avatar + name + date
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Avatar circle
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(listOf(Orange400, Orange600))
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        review.customerName.take(1).uppercase(),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                    )
                }
                Spacer(Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            review.customerName,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        )
                        if (review.verifiedPurchase) {
                            Spacer(Modifier.width(6.dp))
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Success.copy(alpha = 0.15f),
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Icon(Icons.Default.Verified, null, Modifier.size(10.dp), tint = Success)
                                    Spacer(Modifier.width(2.dp))
                                    Text("Verified", fontSize = 9.sp, color = Success, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                    // Format date nicely
                    Text(
                        formatReviewDate(review.createdAt),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            // Star rating row
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                repeat(5) { i ->
                    Icon(
                        Icons.Default.Star, null, Modifier.size(16.dp),
                        tint = if (i < review.rating) StarYellow else MaterialTheme.colorScheme.outline,
                    )
                }
                if (review.title.isNotBlank()) {
                    Spacer(Modifier.width(8.dp))
                    Text(
                        review.title,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                        maxLines = 1, overflow = TextOverflow.Ellipsis,
                    )
                }
            }

            // Comment
            if (review.comment.isNotBlank()) {
                Text(
                    review.comment,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 20.sp,
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Write Review Dialog
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun WriteReviewDialog(
    productName: String,
    isSubmitting: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (rating: Int, title: String, comment: String) -> Unit,
) {
    var rating by remember { mutableIntStateOf(5) }
    var title by remember { mutableStateOf("") }
    var comment by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(20.dp),
        title = {
            Column {
                Text("Write a Review", fontWeight = FontWeight.Bold)
                Text(
                    productName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Star selector
                Column {
                    Text("Rating", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold))
                    Spacer(Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        (1..5).forEach { star ->
                            IconButton(
                                onClick = { rating = star },
                                modifier = Modifier.size(40.dp),
                            ) {
                                Icon(
                                    Icons.Default.Star, null, Modifier.size(32.dp),
                                    tint = if (star <= rating) StarYellow else MaterialTheme.colorScheme.outline,
                                )
                            }
                        }
                    }
                }

                // Title field
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Review Title") },
                    placeholder = { Text("Summarize your review") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                )

                // Comment field
                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("Your Review") },
                    placeholder = { Text("Share your experience with this product...") },
                    minLines = 3,
                    maxLines = 5,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(rating, title, comment) },
                enabled = comment.isNotBlank() && !isSubmitting,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Orange500),
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                }
                Text("Submit Review")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}

// ═══════════════════════════════════════════════════════════════════════
// Variant Selectors (Amazon/Daraz-style)
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun VariantSelectorsSection(
    variantTypes: List<VariantType>,
    skus: List<ProductSku>,
    selectedOptions: Map<String, SelectedVariant>,
    matchedSku: ProductSku?,
    product: Product,
    onSelectVariant: (String, VariantOption) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        variantTypes.forEach { vt ->
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // Label: "Color: Titanium Black"
                Row {
                    Text("${vt.typeName}: ", style = MaterialTheme.typography.titleSmall)
                    Text(
                        selectedOptions[vt.typeName]?.value ?: "—",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    )
                }

                val isColorType = vt.typeName.lowercase().let { it.contains("color") || it.contains("colour") }

                // Options
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(vt.options.size) { idx ->
                        val opt = vt.options[idx]
                        val isSelected = selectedOptions[vt.typeName]?.value == opt.optionValue
                        val displayImage = opt.galleryImages.firstOrNull() ?: opt.optionImage
                        val hasImage = displayImage.isNotBlank() && (isColorType || displayImage != product.featuredImage)

                        // Find min price for this option across all active SKUs
                        val optSkus = skus.filter { sku ->
                            sku.isActive && sku.combination[vt.typeName] == opt.optionValue
                        }
                        val minPrice = if (optSkus.isNotEmpty()) optSkus.minOf { it.price } else null

                        if (hasImage) {
                            // Image card (Amazon-style)
                            VariantImageCard(
                                image = displayImage,
                                label = opt.optionValue,
                                price = minPrice,
                                isSelected = isSelected,
                                onClick = { onSelectVariant(vt.typeName, opt) },
                            )
                        } else {
                            // Text pill (Size/Storage)
                            VariantPill(
                                label = opt.optionValue,
                                price = minPrice,
                                basePrice = product.sellingPrice,
                                isSelected = isSelected,
                                onClick = { onSelectVariant(vt.typeName, opt) },
                            )
                        }
                    }
                }
            }
        }

        // Unavailable combo warning
        if (selectedOptions.size == variantTypes.size && matchedSku == null) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Error.copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Icon(Icons.Default.Warning, null, Modifier.size(18.dp), tint = Error)
                    Text(
                        "This combination is not available",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        color = Error,
                    )
                }
            }
        }
    }
}

@Composable
private fun VariantImageCard(
    image: String,
    label: String,
    price: Double?,
    isSelected: Boolean,
    onClick: () -> Unit,
) {
    val borderColor = if (isSelected) Orange500 else MaterialTheme.colorScheme.outlineVariant
    val borderWidth = if (isSelected) 2.5.dp else 1.dp

    Card(
        onClick = onClick,
        modifier = Modifier.width(80.dp),
        shape = RoundedCornerShape(10.dp),
        border = BorderStroke(borderWidth, borderColor),
        elevation = CardDefaults.cardElevation(if (isSelected) 4.dp else 1.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Orange500.copy(alpha = 0.05f) else MaterialTheme.colorScheme.surface,
        ),
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            AsyncImage(
                model = image,
                contentDescription = label,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().height(64.dp),
            )
            Column(
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 4.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    ),
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                    color = if (isSelected) Orange500 else MaterialTheme.colorScheme.onSurface,
                )
                if (price != null) {
                    Text(
                        "৳${price.toInt()}",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = if (isSelected) Orange500 else MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun VariantPill(
    label: String,
    price: Double?,
    basePrice: Double,
    isSelected: Boolean,
    onClick: () -> Unit,
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(10.dp),
        border = BorderStroke(
            if (isSelected) 2.dp else 1.dp,
            if (isSelected) Orange500 else MaterialTheme.colorScheme.outlineVariant,
        ),
        color = if (isSelected) Orange500.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                label,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                ),
                color = if (isSelected) Orange500 else MaterialTheme.colorScheme.onSurface,
            )
            if (price != null && price != basePrice) {
                Text(
                    "৳${price.toInt()}",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = if (isSelected) Orange500 else MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp,
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun InfoChip(label: String, value: String) {
    Column(
        modifier = Modifier.clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(value, style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold, color = Orange500))
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun TrustRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Icon(icon, null, Modifier.size(20.dp), tint = Orange500)
        Column {
            Text(label, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
            Text(value, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun HighlightRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold))
    }
}

@Composable
private fun RelatedProductCard(product: Product, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.width(150.dp),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(4.dp),
    ) {
        Column {
            AsyncImage(
                model = product.featuredImage,
                contentDescription = product.productName,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().height(130.dp),
            )
            Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    product.productName,
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                    maxLines = 2, overflow = TextOverflow.Ellipsis,
                )
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("৳${product.sellingPrice.toInt()}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Orange500)
                    val discount = product.discountRate.toIntOrNull() ?: 0
                    if (discount > 0) {
                        Text(
                            "৳${product.regularPrice.toInt()}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textDecoration = TextDecoration.LineThrough,
                        )
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, null, Modifier.size(12.dp), tint = StarYellow)
                    Text(" ${product.productRating}", style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

private fun formatReviewDate(isoDate: String): String {
    return try {
        val date = isoDate.substringBefore("T")
        val parts = date.split("-")
        if (parts.size == 3) {
            val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
            val month = months.getOrElse(parts[1].toInt() - 1) { "?" }
            "$month ${parts[2].toInt()}, ${parts[0]}"
        } else isoDate
    } catch (_: Exception) { isoDate }
}

// ═══════════════════════════════════════════════════════════════════════
// Full-Screen Gallery Dialog (Professional Image Viewer)
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun FullScreenGalleryDialog(
    images: List<String>,
    initialPage: Int,
    productName: String,
    onDismiss: () -> Unit,
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
        ),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black),
        ) {
            val pagerState = rememberPagerState(
                initialPage = initialPage.coerceIn(0, images.size - 1),
                pageCount = { images.size },
            )

            // Pager with zoom
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize(),
            ) { page ->
                var scale by remember { mutableFloatStateOf(1f) }
                var offsetX by remember { mutableFloatStateOf(0f) }
                var offsetY by remember { mutableFloatStateOf(0f) }

                // Reset zoom on page change
                LaunchedEffect(pagerState.currentPage) {
                    if (page != pagerState.currentPage) {
                        scale = 1f; offsetX = 0f; offsetY = 0f
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectTransformGestures { _, pan, zoom, _ ->
                                scale = (scale * zoom).coerceIn(1f, 5f)
                                if (scale > 1f) {
                                    val maxX = (size.width * (scale - 1)) / 2
                                    val maxY = (size.height * (scale - 1)) / 2
                                    offsetX = (offsetX + pan.x).coerceIn(-maxX, maxX)
                                    offsetY = (offsetY + pan.y).coerceIn(-maxY, maxY)
                                } else {
                                    offsetX = 0f; offsetY = 0f
                                }
                            }
                        }
                        .pointerInput(Unit) {
                            detectTapGestures(
                                onDoubleTap = {
                                    if (scale > 1.5f) {
                                        scale = 1f; offsetX = 0f; offsetY = 0f
                                    } else {
                                        scale = 3f
                                    }
                                },
                            )
                        },
                    contentAlignment = Alignment.Center,
                ) {
                    AsyncImage(
                        model = images[page],
                        contentDescription = "$productName image ${page + 1}",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .fillMaxSize()
                            .graphicsLayer(
                                scaleX = scale,
                                scaleY = scale,
                                translationX = offsetX,
                                translationY = offsetY,
                            ),
                    )
                }
            }

            // Top bar: close + counter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 8.dp, vertical = 4.dp)
                    .align(Alignment.TopCenter),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, "Close", tint = Color.White, modifier = Modifier.size(28.dp))
                }
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color.White.copy(alpha = 0.2f),
                ) {
                    Text(
                        "${pagerState.currentPage + 1} / ${images.size}",
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
                // Placeholder for symmetric layout
                Spacer(Modifier.size(48.dp))
            }

            // Bottom thumbnail strip
            if (images.size > 1) {
                val scope = rememberCoroutineScope()
                LazyRow(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 24.dp)
                        .navigationBarsPadding(),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(images.size) { idx ->
                        val isCurrent = idx == pagerState.currentPage
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(
                                    if (isCurrent) 2.dp else 0.dp,
                                    if (isCurrent) Orange500 else Color.Transparent,
                                    RoundedCornerShape(8.dp),
                                )
                                .clickable {
                                    scope.launch {
                                        pagerState.animateScrollToPage(idx)
                                    }
                                },
                        ) {
                            AsyncImage(
                                model = images[idx],
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .then(
                                        if (!isCurrent) Modifier.graphicsLayer(alpha = 0.5f)
                                        else Modifier
                                    ),
                            )
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// HTML Text Renderer (strips tags and renders as formatted text)
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun HtmlText(
    html: String,
    style: androidx.compose.ui.text.TextStyle = MaterialTheme.typography.bodyMedium,
    color: Color = MaterialTheme.colorScheme.onSurfaceVariant,
) {
    // Check if the text contains HTML-like table structures
    val hasTable = html.contains("<table", ignoreCase = true)

    if (hasTable) {
        // Parse table into key-value rows
        val rows = parseHtmlTable(html)
        if (rows.isNotEmpty()) {
            Column(verticalArrangement = Arrangement.spacedBy(0.dp)) {
                rows.forEachIndexed { idx, (key, value) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .then(
                                if (idx % 2 == 0) Modifier.background(
                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                    RoundedCornerShape(4.dp),
                                ) else Modifier
                            )
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            key,
                            style = style.copy(fontWeight = FontWeight.Medium),
                            color = color,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            value,
                            style = style.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1f),
                            textAlign = androidx.compose.ui.text.style.TextAlign.End,
                        )
                    }
                    if (idx < rows.size - 1) {
                        HorizontalDivider(
                            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f),
                        )
                    }
                }
            }
        } else {
            // Fallback: strip all tags
            Text(
                text = stripHtmlTags(html),
                style = style,
                color = color,
                lineHeight = 22.sp,
            )
        }
    } else {
        // Strip HTML and render as annotated text
        val annotated = buildAnnotatedHtml(html, style, color)
        Text(
            text = annotated,
            style = style,
            lineHeight = 22.sp,
        )
    }
}

/**
 * Parse HTML table like <table><tr><td>Key</td><td>Value</td></tr>...</table>
 * into a list of (key, value) pairs.
 */
private fun parseHtmlTable(html: String): List<Pair<String, String>> {
    val result = mutableListOf<Pair<String, String>>()
    val rowRegex = Regex("<tr[^>]*>(.*?)</tr>", RegexOption.DOT_MATCHES_ALL)
    val cellRegex = Regex("<td[^>]*>(.*?)</td>", RegexOption.DOT_MATCHES_ALL)

    rowRegex.findAll(html).forEach { rowMatch ->
        val cells = cellRegex.findAll(rowMatch.groupValues[1]).map {
            stripHtmlTags(it.groupValues[1]).trim()
        }.toList()
        if (cells.size >= 2 && cells[0].isNotBlank()) {
            result.add(cells[0] to cells[1])
        }
    }
    return result
}

/** Strip all HTML tags and decode basic entities. */
private fun stripHtmlTags(html: String): String {
    return html
        .replace(Regex("<br\\s*/?>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("</p>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("</h[1-6]>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("</li>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("</tr>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("<[^>]+>"), "")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&nbsp;", " ")
        .replace(Regex("\n{3,}"), "\n\n")
        .trim()
}

/** Build AnnotatedString with bold for <strong>/<b>/<h> tags. */
@Composable
private fun buildAnnotatedHtml(
    html: String,
    style: androidx.compose.ui.text.TextStyle,
    color: Color,
): AnnotatedString {
    val cleaned = html
        .replace(Regex("<br\\s*/?>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("</p>", RegexOption.IGNORE_CASE), "\n\n")
        .replace(Regex("</h[1-6]>", RegexOption.IGNORE_CASE), "\n\n")
        .replace(Regex("</li>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("<li[^>]*>", RegexOption.IGNORE_CASE), "• ")

    return buildAnnotatedString {
        var remaining = cleaned
        val tagPattern = Regex("<(/?)(b|strong|h[1-6]|em|i)[^>]*>", RegexOption.IGNORE_CASE)
        var isBold = false
        var isItalic = false

        while (remaining.isNotEmpty()) {
            val match = tagPattern.find(remaining)
            if (match == null) {
                val text = stripHtmlTags(remaining)
                withStyle(SpanStyle(
                    color = color,
                    fontWeight = if (isBold) FontWeight.Bold else style.fontWeight,
                )) {
                    append(text)
                }
                break
            }

            // Append text before tag
            val before = remaining.substring(0, match.range.first)
            val cleanBefore = stripHtmlTags(before)
            if (cleanBefore.isNotEmpty()) {
                withStyle(SpanStyle(
                    color = color,
                    fontWeight = if (isBold) FontWeight.Bold else style.fontWeight,
                )) {
                    append(cleanBefore)
                }
            }

            // Process tag
            val isClosing = match.groupValues[1] == "/"
            val tagName = match.groupValues[2].lowercase()
            when (tagName) {
                "b", "strong" -> isBold = !isClosing
                "em", "i" -> isItalic = !isClosing
                else -> if (tagName.startsWith("h")) isBold = !isClosing
            }

            remaining = remaining.substring(match.range.last + 1)
        }
    }
}
