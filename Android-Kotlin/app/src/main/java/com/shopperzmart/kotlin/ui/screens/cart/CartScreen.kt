package com.shopperzmart.kotlin.ui.screens.cart

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.clickable
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.domain.model.CartItem
import com.shopperzmart.kotlin.domain.usecase.*
import com.shopperzmart.kotlin.ui.theme.Orange500
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CartViewModel @Inject constructor(
    getCart: GetCartUseCase,
    private val updateQty: UpdateCartQuantityUseCase,
    private val remove: RemoveFromCartUseCase,
    prefs: UserPreferences,
) : ViewModel() {
    val cartItems = getCart().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    /** Exposed so the Cart screen can gate the checkout button */
    val isLoggedIn = prefs.isLoggedIn.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    fun updateQuantity(productId: String, qty: Int) = viewModelScope.launch { updateQty(productId, qty) }
    fun removeItem(productId: String) = viewModelScope.launch { remove(productId) }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onNavigateBack: () -> Unit,
    onCheckout: () -> Unit,
    onNeedLogin: () -> Unit,
    onProductClick: (String) -> Unit = {},
    viewModel: CartViewModel = hiltViewModel(),
) {
    val items by viewModel.cartItems.collectAsState()
    val isLoggedIn by viewModel.isLoggedIn.collectAsState()
    val total = items.sumOf { it.sellingPrice * it.quantity }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Cart", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
            )
        },
        bottomBar = {
            if (items.isNotEmpty()) {
                Surface(shadowElevation = 8.dp) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                            Column {
                                Text("Total Amount", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("৳${total.toInt()}", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = Orange500))
                            }
                            Button(
                                onClick  = { if (isLoggedIn) onCheckout() else onNeedLogin() },
                                modifier = Modifier.height(52.dp),
                                shape    = RoundedCornerShape(12.dp),
                                colors   = ButtonDefaults.buttonColors(containerColor = Orange500),
                            ) {
                                Icon(Icons.Default.ShoppingBag, null, Modifier.size(18.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("Checkout", fontWeight = FontWeight.Bold)
                            }
                        }
                        if (!isLoggedIn) {
                            Text(
                                "⚠️ Sign in to complete your purchase",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (items.isEmpty()) {
            Box(Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Default.ShoppingCart, null, Modifier.size(80.dp), tint = MaterialTheme.colorScheme.outline)
                    Text("Your cart is empty", style = MaterialTheme.typography.titleMedium)
                    Text("Add some products to get started!", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(onClick = onNavigateBack, colors = ButtonDefaults.buttonColors(containerColor = Orange500)) {
                        Text("Start Shopping")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier       = Modifier.padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(items, key = { it.productId }) { item ->
                    CartItemCard(
                        item          = item,
                        onIncrease    = { viewModel.updateQuantity(item.productId, item.quantity + 1) },
                        onDecrease    = { viewModel.updateQuantity(item.productId, item.quantity - 1) },
                        onRemove      = { viewModel.removeItem(item.productId) },
                        onProductClick = { onProductClick(item.productId) },
                    )
                }
            }
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onRemove: () -> Unit,
    onProductClick: () -> Unit = {},
) {
    Card(shape = RoundedCornerShape(16.dp), elevation = CardDefaults.cardElevation(2.dp), modifier = Modifier.clickable { onProductClick() }) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            AsyncImage(
                model              = item.image,
                contentDescription = null,
                contentScale       = ContentScale.Crop,
                modifier           = Modifier.size(80.dp).clip(RoundedCornerShape(12.dp)),
            )
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(item.productName, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), maxLines = 2)
                Text("৳${item.sellingPrice.toInt()}", color = Orange500, fontWeight = FontWeight.Bold)
                Text(item.shopName, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(onClick = onRemove, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Close, null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onDecrease, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Remove, null, modifier = Modifier.size(14.dp))
                    }
                    Text("${item.quantity}", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.widthIn(min = 24.dp))
                    IconButton(onClick = onIncrease, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Add, null, tint = Orange500, modifier = Modifier.size(14.dp))
                    }
                }
            }
        }
    }
}
