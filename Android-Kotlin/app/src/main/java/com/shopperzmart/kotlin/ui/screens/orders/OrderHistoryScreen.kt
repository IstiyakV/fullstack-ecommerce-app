package com.shopperzmart.kotlin.ui.screens.orders

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.domain.model.Order
import com.shopperzmart.kotlin.domain.usecase.GetOrdersUseCase
import com.shopperzmart.kotlin.ui.common.ShimmerOrderList
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrderHistoryViewModel @Inject constructor(
    private val getOrdersUseCase: GetOrdersUseCase,
    private val prefs: UserPreferences,
) : ViewModel() {
    val loading = MutableStateFlow(true)
    val orders = MutableStateFlow<List<Order>>(emptyList())
    val error = MutableStateFlow<String?>(null)

    init {
        loadOrders()
    }

    private fun loadOrders() = viewModelScope.launch {
        loading.value = true
        val userKey = prefs.userKey.first()
        if (userKey.isEmpty()) {
            error.value = "User not logged in"
            loading.value = false
            return@launch
        }
        when (val result = getOrdersUseCase(userKey)) {
            is Result.Success -> orders.value = result.data ?: emptyList()
            is Result.Error -> error.value = result.message
            else -> {}
        }
        loading.value = false
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderHistoryScreen(
    onNavigateBack: () -> Unit,
    onOrderClick: (String) -> Unit = {},
    viewModel: OrderHistoryViewModel = hiltViewModel()
) {
    val loading by viewModel.loading.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val error by viewModel.error.collectAsState()

    Scaffold(
        topBar = { TopAppBar(title = { Text("My Orders", fontWeight = FontWeight.Bold) }, navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }) }
    ) { padding ->
        when {
            loading -> Box(Modifier.padding(padding).fillMaxSize()) { ShimmerOrderList() }
            error != null -> Box(Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) { Text(error!!, color = MaterialTheme.colorScheme.error) }
            orders.isEmpty() -> {
                Box(Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Icon(Icons.Default.Inventory2, null, Modifier.size(72.dp), tint = MaterialTheme.colorScheme.outline)
                        Text("No orders yet", style = MaterialTheme.typography.titleMedium)
                        Text("Your order history will appear here", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier.padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(orders.size) { index ->
                        val o = orders[index]
                        Card(
                            onClick = { onOrderClick(o.orderId) },
                            shape = RoundedCornerShape(14.dp),
                            elevation = CardDefaults.cardElevation(2.dp),
                        ) {
                            Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                                    Text("Order #${o.orderId}", fontWeight = FontWeight.Bold)
                                    Text(formatOrderDate(o.date), color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.labelSmall)
                                }
                                Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                                    Text("৳${o.totalAmount.toInt()}", color = Orange500, fontWeight = FontWeight.SemiBold)
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = orderStatusColor(o.orderStatus).copy(alpha = 0.15f),
                                    ) {
                                        Text(
                                            text = o.orderStatus.replaceFirstChar { it.uppercase() },
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                            color = orderStatusColor(o.orderStatus),
                                            fontWeight = FontWeight.Bold,
                                            style = MaterialTheme.typography.labelMedium,
                                        )
                                    }
                                }
                                // Tap hint
                                Row(Modifier.fillMaxWidth(), Arrangement.End, Alignment.CenterVertically) {
                                    Text("View Details", style = MaterialTheme.typography.labelSmall, color = Orange500)
                                    Icon(Icons.Default.ChevronRight, null, Modifier.size(16.dp), tint = Orange500)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun orderStatusColor(status: String): Color = when (status.lowercase()) {
    "placed"              -> Navy400
    "confirmed"           -> Teal500
    "preparing"           -> Orange500
    "packed"              -> Color(0xFF6366F1)
    "in_transit"          -> Color(0xFF8B5CF6)
    "delivery_assigned"   -> Color(0xFF0EA5E9)
    "out_for_delivery"    -> Color(0xFFF59E0B)
    "delivery_attempt_1",
    "delivery_attempt_2",
    "delivery_attempt_3"  -> Warning
    "delivered"           -> Success
    "delivery_failed"     -> Error
    "cancelled"           -> Error
    // Legacy
    "pending"             -> Warning
    "processing"          -> Orange500
    "shipped"             -> Color(0xFF8B5CF6)
    else                  -> Navy400
}

private fun formatOrderDate(isoDate: String): String {
    return try {
        val date = isoDate.substringBefore("T").substringBefore(" ")
        val parts = date.split("-")
        if (parts.size == 3) {
            val months = listOf("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")
            "${months.getOrElse(parts[1].toInt()-1){"?"}} ${parts[2].toInt()}, ${parts[0]}"
        } else isoDate.take(10)
    } catch (_: Exception) { isoDate.take(10) }
}
