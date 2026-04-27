package com.shopperzmart.kotlin.ui.common

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.data.remote.dto.VoucherDto
import com.shopperzmart.kotlin.data.remote.mapper.toDomain
import com.shopperzmart.kotlin.domain.model.Voucher
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CouponViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    val vouchers = MutableStateFlow<List<Voucher>>(emptyList())
    val loading = MutableStateFlow(true)
    val applyResult = MutableStateFlow<String?>(null)
    val appliedVoucher = MutableStateFlow<Voucher?>(null)

    init { loadVouchers() }

    private fun loadVouchers() = viewModelScope.launch {
        try {
            val res = api.getVouchers(emptyMap())
            vouchers.value = res.data?.map { it.toDomain() } ?: emptyList()
        } catch (_: Exception) {}
        loading.value = false
    }

    fun applyCoupon(code: String) = viewModelScope.launch {
        try {
            val res = api.applyCoupon(mapOf("coupon_code" to code))
            if (res.statusCode == 200 && res.data != null) {
                appliedVoucher.value = res.data.toDomain()
                applyResult.value = res.message ?: "Coupon applied!"
            } else {
                applyResult.value = res.message ?: "Invalid coupon"
            }
        } catch (e: Exception) {
            applyResult.value = e.message ?: "Error applying coupon"
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CouponBottomSheet(
    onDismiss: () -> Unit,
    onCouponApplied: (Voucher) -> Unit,
    viewModel: CouponViewModel = hiltViewModel(),
) {
    val vouchers by viewModel.vouchers.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val applyResult by viewModel.applyResult.collectAsState()
    val appliedVoucher by viewModel.appliedVoucher.collectAsState()

    var manualCode by remember { mutableStateOf("") }

    // Auto-dismiss on successful apply
    LaunchedEffect(appliedVoucher) {
        appliedVoucher?.let { onCouponApplied(it); onDismiss() }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp).padding(bottom = 24.dp),
        ) {
            // Title
            Text("Apply Coupon", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
            Spacer(Modifier.height(16.dp))

            // Manual code entry
            OutlinedTextField(
                value = manualCode,
                onValueChange = { manualCode = it.uppercase() },
                placeholder = { Text("Enter coupon code") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                leadingIcon = { Icon(Icons.Default.LocalOffer, null, tint = Orange500) },
                trailingIcon = {
                    if (manualCode.isNotBlank()) {
                        TextButton(onClick = { viewModel.applyCoupon(manualCode) }) {
                            Text("Apply", color = Orange500, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500),
            )
            if (applyResult != null) {
                Spacer(Modifier.height(4.dp))
                Text(applyResult!!, style = MaterialTheme.typography.bodySmall, color = if (appliedVoucher != null) Success else Error)
            }

            Spacer(Modifier.height(16.dp))
            Text("Available Coupons", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
            Spacer(Modifier.height(8.dp))

            if (loading) {
                Box(Modifier.fillMaxWidth().height(100.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Orange500)
                }
            } else if (vouchers.isEmpty()) {
                Box(Modifier.fillMaxWidth().height(100.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.LocalOffer, null, Modifier.size(40.dp), tint = MaterialTheme.colorScheme.outline)
                        Text("No coupons available", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.heightIn(max = 300.dp),
                ) {
                    items(vouchers) { v ->
                        CouponCard(voucher = v, onApply = { viewModel.applyCoupon(v.voucherCode) })
                    }
                }
            }
        }
    }
}

@Composable
private fun CouponCard(voucher: Voucher, onApply: () -> Unit) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Orange500.copy(alpha = 0.06f)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Orange500.copy(alpha = 0.2f)),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = voucher.voucherCode,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Orange500),
                    textDecoration = TextDecoration.None,
                )
                Text(
                    text = voucher.voucherTitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                val discountText = when {
                    voucher.discountPercent > 0 -> "${voucher.discountPercent.toInt()}% off"
                    voucher.discountAmount > 0 -> "৳${voucher.discountAmount.toInt()} off"
                    else -> "Discount"
                }
                Text(
                    text = discountText,
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = Success,
                )
            }
            OutlinedButton(
                onClick = onApply,
                shape = RoundedCornerShape(10.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Orange500),
            ) {
                Text("Apply", color = Orange500, fontWeight = FontWeight.Bold)
            }
        }
    }
}
