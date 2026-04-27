package com.shopperzmart.kotlin.ui.screens.orders

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.*
import com.shopperzmart.kotlin.domain.usecase.GetOrderDetailUseCase
import com.shopperzmart.kotlin.domain.usecase.CancelOrderUseCase
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import com.shopperzmart.kotlin.ui.common.ShimmerOrderDetail
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ═══════════════════════════════════════════════════════════════════════
// ViewModel
// ═══════════════════════════════════════════════════════════════════════

sealed class OrderDetailState {
    object Loading : OrderDetailState()
    data class Success(val order: OrderDetail) : OrderDetailState()
    data class Error(val msg: String) : OrderDetailState()
}

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    private val getOrderDetail: GetOrderDetailUseCase,
    private val cancelOrderUseCase: CancelOrderUseCase,
) : ViewModel() {
    val state = MutableStateFlow<OrderDetailState>(OrderDetailState.Loading)
    var cancelling by mutableStateOf(false)
    var cancelResult by mutableStateOf<String?>(null)

    fun load(orderId: String) = viewModelScope.launch {
        state.value = OrderDetailState.Loading
        state.value = when (val r = getOrderDetail(orderId)) {
            is Result.Success -> OrderDetailState.Success(r.data!!)
            is Result.Error -> OrderDetailState.Error(r.message)
            else -> OrderDetailState.Loading
        }
    }

    fun cancel(orderId: String) = viewModelScope.launch {
        cancelling = true
        when (val r = cancelOrderUseCase(orderId)) {
            is Result.Success -> {
                cancelResult = r.data
                load(orderId)
            }
            is Result.Error -> cancelResult = r.message
            else -> {}
        }
        cancelling = false
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Screen
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    orderId: String,
    onNavigateBack: () -> Unit,
    onTrackOrder: () -> Unit = {},
    viewModel: OrderDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(orderId) { viewModel.load(orderId) }

    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(viewModel.cancelResult) {
        viewModel.cancelResult?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.cancelResult = null
        }
    }

    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Order #$orderId", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Order ID", orderId))
                        scope.launch { snackbarHostState.showSnackbar("Order ID copied!") }
                    }) {
                        Icon(Icons.Default.ContentCopy, "Copy Order ID", Modifier.size(20.dp))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        when (val s = state) {
            is OrderDetailState.Loading -> Box(Modifier.padding(padding).fillMaxSize()) {
                ShimmerOrderDetail()
            }
            is OrderDetailState.Error -> Box(Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Default.Error, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.error)
                    Text(s.msg, color = MaterialTheme.colorScheme.error)
                    Button(onClick = onNavigateBack) { Text("Go Back") }
                }
            }
            is OrderDetailState.Success -> OrderDetailContent(
                order = s.order,
                cancelling = viewModel.cancelling,
                onCancel = { viewModel.cancel(orderId) },
                onTrackOrder = onTrackOrder,
                modifier = Modifier.padding(padding),
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Content
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun OrderDetailContent(
    order: OrderDetail,
    cancelling: Boolean,
    onCancel: () -> Unit,
    onTrackOrder: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var showCancelDialog by remember { mutableStateOf(false) }
    var showFullTracking by remember { mutableStateOf(false) }

    if (showCancelDialog) {
        AlertDialog(
            onDismissRequest = { showCancelDialog = false },
            shape = RoundedCornerShape(20.dp),
            icon = { Icon(Icons.Default.Warning, null, tint = Error, modifier = Modifier.size(40.dp)) },
            title = { Text("Cancel Order?", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to cancel this order? This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = { showCancelDialog = false; onCancel() },
                    colors = ButtonDefaults.buttonColors(containerColor = Error),
                    shape = RoundedCornerShape(12.dp),
                ) { Text("Yes, Cancel") }
            },
            dismissButton = { TextButton(onClick = { showCancelDialog = false }) { Text("No, Keep") } },
        )
    }

    Column(modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState())) {

        // ── Status Header Card ──────────────────────────────────────────
        StatusHeaderCard(order)

        Spacer(Modifier.height(16.dp))

        // ── Compact Timeline (first 3 stages) ──────────────────────────
        if (order.timeline.isNotEmpty()) {
            SectionTitle("Order Timeline", Icons.Default.Timeline)
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(1.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(Modifier.padding(16.dp)) {
                    val displayTimeline = if (showFullTracking) order.timeline else order.timeline.take(3)
                    displayTimeline.forEachIndexed { index, entry ->
                        TimelineStep(
                            entry = entry,
                            isFirst = index == 0,
                            isLast = index == displayTimeline.lastIndex,
                            isActive = index == displayTimeline.lastIndex && !showFullTracking ||
                                       (showFullTracking && index == order.timeline.lastIndex),
                        )
                    }

                    // "Track Delivery" button
                    if (order.timeline.size > 3) {
                        Spacer(Modifier.height(8.dp))
                        Button(
                            onClick = { showFullTracking = !showFullTracking },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (showFullTracking) MaterialTheme.colorScheme.surfaceVariant
                                else Orange500,
                            ),
                        ) {
                            Icon(
                                if (showFullTracking) Icons.Default.ExpandLess else Icons.Default.LocalShipping,
                                null, Modifier.size(18.dp),
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                if (showFullTracking) "Show Less" else "Track Delivery",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // ── Track Package Button ─────────────────────────────────────
        if (order.orderStatus !in listOf("cancelled", "delivered")) {
            Button(
                onClick = onTrackOrder,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(48.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
            ) {
                Icon(Icons.Default.LocalShipping, null, Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Track Package", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Order Items ─────────────────────────────────────────────────
        if (order.items.isNotEmpty()) {
            SectionTitle("Items (${order.items.size})", Icons.Default.ShoppingBag)
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(1.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(Modifier.padding(12.dp)) {
                    order.items.forEachIndexed { index, item ->
                        OrderItemRow(item)
                        if (index < order.items.lastIndex) {
                            HorizontalDivider(
                                Modifier.padding(vertical = 10.dp),
                                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Price Breakdown ─────────────────────────────────────────────
        SectionTitle("Price Summary", Icons.Default.Receipt)
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(1.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                val subtotal = order.totalAmount - order.shippingFee + order.discountAmount
                PriceRow("Subtotal", "৳${subtotal.toInt()}")
                PriceRow("Shipping Fee (${order.shippingMethod})", "৳${order.shippingFee.toInt()}")
                if (order.discountAmount > 0) {
                    PriceRow("Discount", "-৳${order.discountAmount.toInt()}", color = Success)
                }
                if (order.couponCode.isNotBlank()) {
                    PriceRow("Coupon", order.couponCode, color = Teal500)
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Total", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("৳${order.totalAmount.toInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Orange500)
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Payment & Shipping Info ─────────────────────────────────────
        SectionTitle("Payment & Shipping", Icons.Default.CreditCard)
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(1.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                InfoRow("Payment", paymentLabel(order.paymentMethod), Icons.Default.Payment)
                InfoRow("Payment Status", order.paymentStatus.replaceFirstChar { it.uppercase() }, Icons.Default.CheckCircle)
                InfoRow("Shipping", order.shippingMethod.replaceFirstChar { it.uppercase() }, Icons.Default.LocalShipping)
                if (order.trackingNumber.isNotBlank()) {
                    InfoRow("Tracking #", order.trackingNumber, Icons.Default.QrCode)
                }
                if (order.estimatedDelivery.isNotBlank()) {
                    InfoRow("Est. Delivery", formatDate(order.estimatedDelivery), Icons.Default.CalendarMonth)
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Shipping Address ────────────────────────────────────────────
        if (order.shippingAddress.fullAddress.isNotBlank()) {
            SectionTitle("Delivery Address", Icons.Default.LocationOn)
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(1.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    with(order.shippingAddress) {
                        if (recipientName.isNotBlank()) Text(recipientName, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        if (fullAddress.isNotBlank()) Text(fullAddress, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (cityName.isNotBlank()) Text(cityName, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (postalCode.isNotBlank()) Text("• $postalCode", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (phone.isNotBlank()) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Phone, null, Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                Spacer(Modifier.width(4.dp))
                                Text(phone, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // ── Cancel Button ───────────────────────────────────────────────
        if (order.canCancel) {
            OutlinedButton(
                onClick = { showCancelDialog = true },
                enabled = !cancelling,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(52.dp),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Error),
            ) {
                if (cancelling) {
                    CircularProgressIndicator(Modifier.size(18.dp), color = Error, strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                }
                Icon(Icons.Default.Cancel, null, Modifier.size(18.dp), tint = Error)
                Spacer(Modifier.width(8.dp))
                Text("Cancel Order", color = Error, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Status Header Card — Premium gradient banner
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun StatusHeaderCard(order: OrderDetail) {
    val sColor = statusColor(order.orderStatus)
    Card(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(4.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        listOf(sColor, sColor.copy(alpha = 0.7f))
                    )
                )
                .padding(20.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Status icon in white circle
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.2f),
                    modifier = Modifier.size(56.dp),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(statusIcon(order.orderStatus), null, Modifier.size(28.dp), tint = Color.White)
                    }
                }
                Spacer(Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        statusLabel(order.orderStatus),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                        color = Color.White,
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        "Placed on ${formatDate(order.createdAt)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.85f),
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "৳${order.totalAmount.toInt()}",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                        color = Color.White,
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun SectionTitle(title: String, icon: ImageVector) {
    Row(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(icon, null, Modifier.size(20.dp), tint = Orange500)
        Text(title, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
    }
}

@Composable
private fun TimelineStep(
    entry: TimelineEntry,
    isFirst: Boolean,
    isLast: Boolean,
    isActive: Boolean,
) {
    val dotColor = statusColor(entry.status)
    Row(modifier = Modifier.fillMaxWidth().animateContentSize()) {
        // Dot + connecting line
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(36.dp)) {
            if (!isFirst) {
                Box(
                    Modifier
                        .width(2.5.dp)
                        .height(16.dp)
                        .background(dotColor.copy(alpha = 0.25f))
                )
            }
            // Dot
            Box(
                modifier = Modifier
                    .size(if (isActive) 18.dp else 12.dp)
                    .clip(CircleShape)
                    .background(if (isActive) dotColor else dotColor.copy(alpha = 0.4f))
                    .then(
                        if (isActive) Modifier.border(2.dp, dotColor.copy(alpha = 0.3f), CircleShape)
                        else Modifier
                    ),
                contentAlignment = Alignment.Center,
            ) {
                if (isActive) {
                    Icon(Icons.Default.Check, null, Modifier.size(10.dp), tint = Color.White)
                }
            }
            if (!isLast) {
                Box(
                    Modifier
                        .width(2.5.dp)
                        .height(16.dp)
                        .background(dotColor.copy(alpha = 0.25f))
                )
            }
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f).padding(bottom = if (isLast) 0.dp else 4.dp)) {
            Text(
                statusLabel(entry.status),
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium,
                ),
                color = if (isActive) dotColor else MaterialTheme.colorScheme.onSurface,
            )
            if (entry.note.isNotBlank()) {
                Text(
                    entry.note,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(
                formatDateTime(entry.timestamp),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.outline,
            )
        }
    }
}

@Composable
private fun OrderItemRow(item: OrderItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Product image with fallback
        Card(
            shape = RoundedCornerShape(10.dp),
            elevation = CardDefaults.cardElevation(1.dp),
            modifier = Modifier.size(64.dp),
        ) {
            if (item.image.isNotBlank()) {
                AsyncImage(
                    model = item.image,
                    contentDescription = item.productName,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            } else {
                // Fallback placeholder
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Default.ShoppingBag, null,
                        Modifier.size(28.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                if (item.productName.isNotBlank()) item.productName else "Product #${item.productId}",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                maxLines = 2, overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.height(2.dp))
            Text(
                "Qty: ${item.quantity} × ৳${item.sellingPrice.toInt()}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Text(
            "৳${(item.sellingPrice * item.quantity).toInt()}",
            fontWeight = FontWeight.Bold,
            color = Orange500,
            fontSize = 15.sp,
        )
    }
}

@Composable
private fun PriceRow(label: String, value: String, color: Color = MaterialTheme.colorScheme.onSurface) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = color)
    }
}

@Composable
private fun InfoRow(label: String, value: String, icon: ImageVector) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = Orange500.copy(alpha = 0.1f),
            modifier = Modifier.size(32.dp),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(icon, null, Modifier.size(16.dp), tint = Orange500)
            }
        }
        Spacer(Modifier.width(12.dp))
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.width(100.dp))
        Text(value, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = MaterialTheme.colorScheme.onSurface)
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers — full 10-stage pipeline
// ═══════════════════════════════════════════════════════════════════════

private fun statusColor(status: String): Color = when (status.lowercase()) {
    "placed"              -> Navy400
    "confirmed"           -> Teal500
    "preparing"           -> Orange500
    "packed"              -> Color(0xFF6366F1) // indigo
    "in_transit"          -> Color(0xFF8B5CF6) // purple
    "delivery_assigned"   -> Color(0xFF0EA5E9) // sky blue
    "out_for_delivery"    -> Color(0xFFF59E0B) // amber
    "delivery_attempt_1",
    "delivery_attempt_2",
    "delivery_attempt_3"  -> Warning
    "delivered"           -> Success
    "delivery_failed"     -> Error
    "cancelled"           -> Error
    // Legacy statuses
    "pending"             -> Warning
    "processing"          -> Orange500
    "shipped"             -> Color(0xFF8B5CF6)
    else                  -> Navy400 // custom stages from admin
}

private fun statusIcon(status: String): ImageVector = when (status.lowercase()) {
    "placed"              -> Icons.Default.ShoppingCart
    "confirmed"           -> Icons.Default.CheckCircle
    "preparing"           -> Icons.Default.Restaurant
    "packed"              -> Icons.Default.Inventory2
    "in_transit"          -> Icons.Default.LocalShipping
    "delivery_assigned"   -> Icons.Default.Person
    "out_for_delivery"    -> Icons.Default.DeliveryDining
    "delivery_attempt_1",
    "delivery_attempt_2",
    "delivery_attempt_3"  -> Icons.Default.Refresh
    "delivered"           -> Icons.Default.DoneAll
    "delivery_failed"     -> Icons.Default.ErrorOutline
    "cancelled"           -> Icons.Default.Cancel
    // Legacy
    "pending"             -> Icons.Default.HourglassEmpty
    "processing"          -> Icons.Default.Settings
    "shipped"             -> Icons.Default.LocalShipping
    else                  -> Icons.Default.Info
}

private fun statusLabel(status: String): String = when (status.lowercase()) {
    "placed"              -> "Order Placed"
    "confirmed"           -> "Confirmed"
    "preparing"           -> "Preparing Order"
    "packed"              -> "Packed"
    "in_transit"          -> "In Transit / Hub"
    "delivery_assigned"   -> "Delivery Person Assigned"
    "out_for_delivery"    -> "Out For Delivery"
    "delivery_attempt_1"  -> "Delivery Attempt 1"
    "delivery_attempt_2"  -> "Delivery Attempt 2"
    "delivery_attempt_3"  -> "Delivery Attempt 3"
    "delivered"           -> "Delivered"
    "delivery_failed"     -> "Delivery Failed"
    "cancelled"           -> "Cancelled"
    // Legacy
    "pending"             -> "Pending"
    "processing"          -> "Processing"
    "shipped"             -> "Shipped"
    "note"                -> "Note"
    else                  -> status.replace("_", " ").replaceFirstChar { it.uppercase() }
}

private fun paymentLabel(method: String): String = when (method.lowercase()) {
    "cod"    -> "Cash on Delivery"
    "stripe" -> "Stripe (Card)"
    "bkash"  -> "bKash"
    else     -> method.replaceFirstChar { it.uppercase() }
}

private fun formatDate(isoDate: String): String {
    return try {
        val date = isoDate.substringBefore("T").substringBefore(" ")
        val parts = date.split("-")
        if (parts.size == 3) {
            val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
            val month = months.getOrElse(parts[1].toInt() - 1) { "?" }
            "$month ${parts[2].toInt()}, ${parts[0]}"
        } else isoDate
    } catch (_: Exception) { isoDate }
}

private fun formatDateTime(isoDate: String): String {
    return try {
        val date = formatDate(isoDate)
        val time = isoDate.substringAfter("T").take(5)
        "$date at $time"
    } catch (_: Exception) { isoDate }
}
