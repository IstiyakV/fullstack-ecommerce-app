package com.shopperzmart.kotlin.ui.screens.wishlist

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.data.local.entity.WishlistEntity
import com.shopperzmart.kotlin.domain.model.CartItem
import com.shopperzmart.kotlin.domain.usecase.AddToCartUseCase
import com.shopperzmart.kotlin.domain.usecase.GetWishlistUseCase
import com.shopperzmart.kotlin.domain.usecase.RemoveFromWishlistUseCase
import com.shopperzmart.kotlin.ui.theme.Orange500
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WishlistViewModel @Inject constructor(
    getWishlist: GetWishlistUseCase,
    private val removeFromWishlist: RemoveFromWishlistUseCase,
    private val addToCartUseCase: AddToCartUseCase,
) : ViewModel() {

    val items = getWishlist().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun remove(productId: String) = viewModelScope.launch {
        removeFromWishlist(productId)
    }

    fun moveToCart(item: WishlistEntity) = viewModelScope.launch {
        addToCartUseCase(
            CartItem(
                productId = item.productId,
                productName = item.productName,
                image = item.image,
                sellingPrice = item.sellingPrice,
                regularPrice = item.sellingPrice, // Fix type mismatch
                quantity = 1,
                shopName = item.shopName,
                deliveryCharge = "0.0" // Default handling
            )
        )
        removeFromWishlist(item.productId)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(
    onNavigateBack: () -> Unit,
    onNavigateToCart: () -> Unit,
    onProductClick: (String) -> Unit = {},
    viewModel: WishlistViewModel = hiltViewModel()
) {
    val items by viewModel.items.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Wishlist", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToCart) {
                        Icon(Icons.Default.ShoppingCart, "Cart", tint = Orange500)
                    }
                }
            )
        }
    ) { padding ->
        if (items.isEmpty()) {
            Box(Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Default.FavoriteBorder, null, Modifier.size(80.dp), tint = MaterialTheme.colorScheme.outline)
                    Text("Your wishlist is empty", style = MaterialTheme.typography.titleMedium)
                    Text("Save items you love here!", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(onClick = onNavigateBack, colors = ButtonDefaults.buttonColors(containerColor = Orange500)) {
                        Text("Start Shopping")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(items, key = { it.productId }) { item ->
                    WishlistCard(
                        item = item,
                        onRemove = { viewModel.remove(item.productId) },
                        onMoveToCart = { viewModel.moveToCart(item) },
                        onProductClick = { onProductClick(item.productId) },
                    )
                }
            }
        }
    }
}

@Composable
private fun WishlistCard(
    item: WishlistEntity,
    onRemove: () -> Unit,
    onMoveToCart: () -> Unit,
    onProductClick: () -> Unit = {},
) {
    Card(shape = RoundedCornerShape(16.dp), elevation = CardDefaults.cardElevation(2.dp), modifier = Modifier.clickable { onProductClick() }) {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            AsyncImage(
                model = item.image,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(80.dp).clip(RoundedCornerShape(12.dp)),
            )

            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(item.productName, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), maxLines = 2)
                Text("৳${item.sellingPrice.toInt()}", color = Orange500, fontWeight = FontWeight.Bold)
                Text(item.shopName, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(onClick = onRemove, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Close, null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(20.dp))
                }
                IconButton(
                    onClick = onMoveToCart,
                    modifier = Modifier.size(36.dp).clip(RoundedCornerShape(8.dp)).background(Orange500)
                ) {
                    Icon(Icons.Default.ShoppingCart, "Move to Cart", tint = androidx.compose.ui.graphics.Color.White, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}
