package com.shopperzmart.kotlin.ui.screens.checkout

import androidx.compose.animation.*
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.data.remote.dto.CityDto
import com.shopperzmart.kotlin.data.remote.dto.PaymentGatewayDto
import com.shopperzmart.kotlin.data.remote.dto.ShippingZoneDto
import com.shopperzmart.kotlin.domain.model.Address
import com.shopperzmart.kotlin.domain.model.CartItem
import com.shopperzmart.kotlin.domain.usecase.*
import com.shopperzmart.kotlin.ui.theme.Orange500
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ═══════════════════════════════════════════════════════════════════════
// ViewModel
// ═══════════════════════════════════════════════════════════════════════

enum class CheckoutStep { ADDRESS, SHIPPING, PAYMENT, REVIEW }

data class CheckoutUiState(
    val step: CheckoutStep = CheckoutStep.ADDRESS,
    val cartItems: List<CartItem> = emptyList(),
    val addresses: List<Address> = emptyList(),
    val cities: List<CityDto> = emptyList(),
    val shippingZone: ShippingZoneDto? = null,
    val paymentGateways: List<PaymentGatewayDto> = emptyList(),
    val appConfig: Map<String, String> = emptyMap(),
    // selections
    val selectedAddress: Address? = null,
    val selectedShipping: String = "standard",
    val selectedGateway: String = "cod",
    val couponCode: String = "",
    val couponDiscount: Double = 0.0,
    val orderNote: String = "",
    // guest checkout
    val isGuest: Boolean = false,
    val guestName: String = "",
    val guestPhone: String = "",
    val guestAddress: String = "",
    val guestCity: String = "",
    // derived
    val shippingFee: Double = 0.0,
    val estimatedDelivery: String = "",
    // status
    val isLoading: Boolean = false,
    val isPlacingOrder: Boolean = false,
    val orderSuccess: Boolean = false,
    val orderId: String = "",
    val errorMessage: String? = null,
) {
    val currencySymbol get() = appConfig["currency_symbol"] ?: "\u09F3"
    val subtotal get() = cartItems.sumOf { it.sellingPrice * it.quantity }
    val total get() = subtotal + shippingFee - couponDiscount
    val isGuestAddressValid get() = guestName.isNotBlank() && guestPhone.length >= 10 && guestAddress.isNotBlank()
}

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val getCart: GetCartUseCase,
    private val placeOrderUseCase: PlaceOrderUseCase,
    private val clearCartUseCase: ClearCartUseCase,
    private val getAddressesUseCase: GetAddressesUseCase,
    private val getCitiesUseCase: GetCitiesUseCase,
    private val getShippingZoneForCityUseCase: GetShippingZoneForCityUseCase,
    private val getAppConfigUseCase: GetAppConfigUseCase,
    private val getPaymentGatewaysUseCase: GetPaymentGatewaysUseCase,
    private val prefs: UserPreferences,
) : ViewModel() {
    private val _state = MutableStateFlow(CheckoutUiState())
    val state: StateFlow<CheckoutUiState> = _state

    init { loadInitialData() }

    private fun loadInitialData() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true)
        val userKey = prefs.userKey.first()
        val cartItems = getCart().first()

        val isGuest = userKey.isBlank()
        val addresses = if (isGuest) emptyList() else
            (getAddressesUseCase(userKey) as? Result.Success)?.data ?: emptyList()
        val cities = (getCitiesUseCase() as? Result.Success)?.data ?: emptyList()
        val config = (getAppConfigUseCase() as? Result.Success)?.data ?: emptyMap()
        val gateways = (getPaymentGatewaysUseCase() as? Result.Success)?.data ?: emptyList()

        val defAddress = addresses.find { it.isDefault } ?: addresses.firstOrNull()

        _state.value = _state.value.copy(
            isLoading = false,
            isGuest = isGuest,
            cartItems = cartItems,
            addresses = addresses,
            cities = cities,
            appConfig = config,
            paymentGateways = gateways,
            selectedAddress = defAddress,
        )

        // Auto-load shipping zone for the first/default address
        defAddress?.let { loadShippingForCity(it.cityId) }
    }

    fun loadAddresses() = viewModelScope.launch {
        val userKey = prefs.userKey.first()
        if (userKey.isNotBlank()) {
            val addresses = (getAddressesUseCase(userKey) as? Result.Success)?.data ?: emptyList()
            // Keep selected address if it still exists, else pick default or first
            val currentSelectedHasId = addresses.any { it.addressId == _state.value.selectedAddress?.addressId }
            val newSelected = if (currentSelectedHasId) _state.value.selectedAddress 
                              else addresses.find { it.isDefault } ?: addresses.firstOrNull()
            _state.value = _state.value.copy(
                addresses = addresses,
                selectedAddress = newSelected
            )
            if (!currentSelectedHasId) {
                newSelected?.let { loadShippingForCity(it.cityId) }
            }
        }
    }

    fun selectAddress(address: Address) {
        _state.value = _state.value.copy(selectedAddress = address)
        loadShippingForCity(address.cityId)
    }

    private fun loadShippingForCity(cityId: String) = viewModelScope.launch {
        if (cityId.isBlank()) return@launch
        val result = getShippingZoneForCityUseCase(cityId)
        if (result is Result.Success) {
            val zone = result.data.shippingZone
            val method = _state.value.selectedShipping
            val fee = if (method == "express" && zone?.hasExpress == "1") {
                zone.expressFee?.toDoubleOrNull() ?: 0.0
            } else {
                zone?.standardFee?.toDoubleOrNull() ?: 0.0
            }
            val delivery = if (method == "express" && zone?.hasExpress == "1") {
                "${zone.expressMinDays}-${zone.expressMaxDays} days"
            } else {
                "${zone?.standardMinDays}-${zone?.standardMaxDays} days"
            }
            _state.value = _state.value.copy(
                shippingZone = zone,
                shippingFee = fee,
                estimatedDelivery = delivery,
            )
        }
    }

    fun selectShipping(method: String) {
        val zone = _state.value.shippingZone
        val fee = if (method == "express" && zone?.hasExpress == "1") {
            zone.expressFee?.toDoubleOrNull() ?: 0.0
        } else {
            zone?.standardFee?.toDoubleOrNull() ?: 0.0
        }
        val delivery = if (method == "express" && zone?.hasExpress == "1") {
            "${zone.expressMinDays}-${zone.expressMaxDays} days"
        } else {
            "${zone?.standardMinDays}-${zone?.standardMaxDays} days"
        }
        _state.value = _state.value.copy(
            selectedShipping = method,
            shippingFee = fee,
            estimatedDelivery = delivery,
        )
    }

    fun selectGateway(gateway: String) {
        _state.value = _state.value.copy(selectedGateway = gateway)
    }

    fun setCoupon(code: String) {
        _state.value = _state.value.copy(couponCode = code)
    }

    fun setOrderNote(note: String) {
        _state.value = _state.value.copy(orderNote = note)
    }

    fun nextStep() {
        val current = _state.value.step
        val next = when (current) {
            CheckoutStep.ADDRESS -> {
                if (_state.value.isGuest) {
                    if (!_state.value.isGuestAddressValid) {
                        _state.value = _state.value.copy(errorMessage = "Please fill in all address fields")
                        return
                    }
                } else if (_state.value.selectedAddress == null) {
                    _state.value = _state.value.copy(errorMessage = "Please select a delivery address")
                    return
                }
                CheckoutStep.SHIPPING
            }
            CheckoutStep.SHIPPING -> CheckoutStep.PAYMENT
            CheckoutStep.PAYMENT -> CheckoutStep.REVIEW
            CheckoutStep.REVIEW -> return
        }
        _state.value = _state.value.copy(step = next, errorMessage = null)
    }

    fun previousStep() {
        val prev = when (_state.value.step) {
            CheckoutStep.ADDRESS -> return
            CheckoutStep.SHIPPING -> CheckoutStep.ADDRESS
            CheckoutStep.PAYMENT -> CheckoutStep.SHIPPING
            CheckoutStep.REVIEW -> CheckoutStep.PAYMENT
        }
        _state.value = _state.value.copy(step = prev, errorMessage = null)
    }

    fun updateGuestField(field: String, value: String) {
        _state.value = when (field) {
            "name" -> _state.value.copy(guestName = value)
            "phone" -> _state.value.copy(guestPhone = value)
            "address" -> _state.value.copy(guestAddress = value)
            "city" -> _state.value.copy(guestCity = value)
            else -> _state.value
        }
    }

    fun placeOrder() = viewModelScope.launch {
        _state.value = _state.value.copy(isPlacingOrder = true, errorMessage = null)
        val s = _state.value
        val userKey = prefs.userKey.first()
        val addr = s.selectedAddress

        val shippingAddress = if (s.isGuest) {
            mapOf(
                "recipient_name" to s.guestName,
                "phone" to s.guestPhone,
                "full_address" to s.guestAddress,
                "city_name" to s.guestCity,
            )
        } else {
            mapOf(
                "recipient_name" to (addr?.recipientName ?: ""),
                "phone" to (addr?.phone ?: ""),
                "full_address" to (addr?.fullAddress ?: ""),
                "city_name" to (addr?.cityName ?: ""),
            )
        }

        val payload = mapOf<String, Any>(
            "user_key" to (if (s.isGuest) "guest" else userKey),
            "address_id" to (addr?.addressId ?: ""),
            "shipping_address" to shippingAddress,
            "shipping_method" to s.selectedShipping,
            "shipping_fee" to s.shippingFee.toString(),
            "payment_method" to s.selectedGateway,
            "coupon_code" to s.couponCode,
            "discount_amount" to s.couponDiscount.toString(),
            "total_amount" to s.total.toString(),
            "estimated_delivery" to s.estimatedDelivery,
            "order_note" to s.orderNote,
            "items" to s.cartItems.map {
                mapOf(
                    "product_id" to it.productId,
                    "product_name" to it.productName,
                    "image" to it.image,
                    "selling_price" to it.sellingPrice.toString(),
                    "quantity" to it.quantity.toString(),
                    "shop_name" to it.shopName,
                )
            },
        )

        when (val result = placeOrderUseCase(payload)) {
            is Result.Success -> {
                clearCartUseCase()
                _state.value = _state.value.copy(isPlacingOrder = false, orderSuccess = true)
            }
            is Result.Error -> _state.value = _state.value.copy(isPlacingOrder = false, errorMessage = result.message)
            else -> _state.value = _state.value.copy(isPlacingOrder = false)
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Screen
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onNavigateBack: () -> Unit,
    onOrderPlaced: () -> Unit,
    onAddAddressClick: () -> Unit,
    viewModel: CheckoutViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val lifecycleOwner = androidx.compose.ui.platform.LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                viewModel.loadAddresses()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    // Order success screen
    if (state.orderSuccess) {
        OrderSuccessScreen(onOrderPlaced)
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Checkout", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {
                        if (state.step == CheckoutStep.ADDRESS) onNavigateBack()
                        else viewModel.previousStep()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
            )
        },
        bottomBar = {
            Surface(shadowElevation = 8.dp) {
                Column(Modifier.padding(16.dp)) {
                    // Price summary
                    Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                        Text("Subtotal", style = MaterialTheme.typography.bodyMedium)
                        Text("${state.currencySymbol}${state.subtotal.toInt()}")
                    }
                    if (state.shippingFee > 0) {
                        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                            Text("Shipping", style = MaterialTheme.typography.bodyMedium)
                            Text("${state.currencySymbol}${state.shippingFee.toInt()}")
                        }
                    }
                    if (state.couponDiscount > 0) {
                        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                            Text("Discount", style = MaterialTheme.typography.bodyMedium, color = Color(0xFF4CAF50))
                            Text("-${state.currencySymbol}${state.couponDiscount.toInt()}", color = Color(0xFF4CAF50))
                        }
                    }
                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                        Text("Total", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("${state.currencySymbol}${state.total.toInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Orange500)
                    }
                    Spacer(Modifier.height(12.dp))
                    Button(
                        onClick = {
                            if (state.step == CheckoutStep.REVIEW) viewModel.placeOrder()
                            else viewModel.nextStep()
                        },
                        enabled = !state.isPlacingOrder && !state.isLoading,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Orange500),
                    ) {
                        if (state.isPlacingOrder) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(
                                when (state.step) {
                                    CheckoutStep.REVIEW -> Icons.Default.ShoppingBag
                                    else -> Icons.Default.ArrowForward
                                }, null, Modifier.size(18.dp)
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                when (state.step) {
                                    CheckoutStep.REVIEW -> "Place Order"
                                    else -> "Continue"
                                }, fontWeight = FontWeight.Bold, fontSize = 16.sp
                            )
                        }
                    }
                }
            }
        },
    ) { padding ->
        Column(Modifier.padding(padding)) {
            // Step indicator
            StepIndicator(state.step)

            if (state.errorMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                ) {
                    Text(state.errorMessage!!, Modifier.padding(12.dp), color = MaterialTheme.colorScheme.onErrorContainer)
                }
            }

            // Step content
            AnimatedContent(targetState = state.step, label = "checkout_step") { step ->
                when (step) {
                    CheckoutStep.ADDRESS -> AddressStep(state, viewModel, onAddAddressClick)
                    CheckoutStep.SHIPPING -> ShippingStep(state, viewModel)
                    CheckoutStep.PAYMENT -> PaymentStep(state, viewModel)
                    CheckoutStep.REVIEW -> ReviewStep(state, viewModel)
                }
            }
        }
    }
}

// ── Step Indicator ──────────────────────────────────────────────────────

@Composable
private fun StepIndicator(currentStep: CheckoutStep) {
    val steps = CheckoutStep.entries
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        steps.forEachIndexed { idx, step ->
            val isActive = step == currentStep
            val isDone = step.ordinal < currentStep.ordinal
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = when {
                        isDone -> Color(0xFF4CAF50)
                        isActive -> Orange500
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    },
                    modifier = Modifier.size(32.dp),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        if (isDone) Icon(Icons.Default.Check, null, Modifier.size(18.dp), tint = Color.White)
                        else Text("${idx + 1}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = if (isActive) Color.White else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    when (step) {
                        CheckoutStep.ADDRESS -> "Address"
                        CheckoutStep.SHIPPING -> "Shipping"
                        CheckoutStep.PAYMENT -> "Payment"
                        CheckoutStep.REVIEW -> "Review"
                    },
                    fontSize = 11.sp,
                    fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                    color = if (isActive) Orange500 else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

// ── Step 1: Address ─────────────────────────────────────────────────────

@Composable
private fun AddressStep(state: CheckoutUiState, viewModel: CheckoutViewModel, onAddAddressClick: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Select Delivery Address", fontWeight = FontWeight.Bold, fontSize = 18.sp)

        // Guest checkout inline form
        if (state.isGuest) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Orange500.copy(alpha = 0.05f)),
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PersonOutline, null, tint = Orange500)
                        Spacer(Modifier.width(8.dp))
                        Text("Guest Checkout", fontWeight = FontWeight.Bold, color = Orange500)
                    }
                    OutlinedTextField(
                        value = state.guestName,
                        onValueChange = { viewModel.updateGuestField("name", it) },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                    )
                    OutlinedTextField(
                        value = state.guestPhone,
                        onValueChange = { viewModel.updateGuestField("phone", it) },
                        label = { Text("Phone Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                    )
                    OutlinedTextField(
                        value = state.guestAddress,
                        onValueChange = { viewModel.updateGuestField("address", it) },
                        label = { Text("Full Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                    )
                    OutlinedTextField(
                        value = state.guestCity,
                        onValueChange = { viewModel.updateGuestField("city", it) },
                        label = { Text("City") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                    )
                }
            }
        } else if (state.addresses.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(16.dp),
            ) {
                Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.LocationOff, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.outline)
                    Spacer(Modifier.height(8.dp))
                    Text("No saved addresses", fontWeight = FontWeight.SemiBold)
                    Text("Please add an address to continue checkout", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = onAddAddressClick,
                        colors = ButtonDefaults.buttonColors(containerColor = Orange500),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Add, null, Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Add New Address")
                    }
                }
            }
        } else {
            state.addresses.forEach { addr ->
                val isSelected = state.selectedAddress?.addressId == addr.addressId
                OutlinedCard(
                    onClick = { viewModel.selectAddress(addr) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) Orange500 else MaterialTheme.colorScheme.outline),
                ) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(selected = isSelected, onClick = { viewModel.selectAddress(addr) }, colors = RadioButtonDefaults.colors(selectedColor = Orange500))
                        Spacer(Modifier.width(8.dp))
                        Column(Modifier.weight(1f)) {
                            Row {
                                Text(addr.recipientName, fontWeight = FontWeight.Bold)
                                Spacer(Modifier.width(8.dp))
                                Text(addr.label.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                                if (addr.isDefault) {
                                    Spacer(Modifier.width(8.dp))
                                    Text("Default", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = Orange500)
                                }
                            }
                            Text(addr.fullAddress, style = MaterialTheme.typography.bodySmall)
                            Text("${addr.cityName} • ${addr.phone}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                onClick = onAddAddressClick,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Orange500),
                border = BorderStroke(1.dp, Orange500)
            ) {
                Icon(Icons.Default.Add, null, Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Add Another Address", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// ── Step 2: Shipping ────────────────────────────────────────────────────

@Composable
private fun ShippingStep(state: CheckoutUiState, viewModel: CheckoutViewModel) {
    val zone = state.shippingZone
    Column(
        Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Choose Shipping Method", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        Text("Delivering to: ${state.selectedAddress?.cityName ?: "—"}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)

        // Standard
        if (zone?.hasStandard == "1") {
            ShippingOptionCard(
                title = "Standard Delivery",
                fee = "${state.currencySymbol}${zone.standardFee}",
                delivery = "${zone.standardMinDays}-${zone.standardMaxDays} days",
                isSelected = state.selectedShipping == "standard",
                onClick = { viewModel.selectShipping("standard") },
            )
        }

        // Express
        if (zone?.hasExpress == "1") {
            ShippingOptionCard(
                title = "Express Delivery",
                fee = "${state.currencySymbol}${zone.expressFee}",
                delivery = "${zone.expressMinDays}-${zone.expressMaxDays} days",
                isSelected = state.selectedShipping == "express",
                onClick = { viewModel.selectShipping("express") },
            )
        }

        if (zone == null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            ) {
                Text("Shipping info not available for this location", Modifier.padding(16.dp))
            }
        }
    }
}

@Composable
private fun ShippingOptionCard(title: String, fee: String, delivery: String, isSelected: Boolean, onClick: () -> Unit) {
    OutlinedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) Orange500 else MaterialTheme.colorScheme.outline),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            RadioButton(selected = isSelected, onClick = onClick, colors = RadioButtonDefaults.colors(selectedColor = Orange500))
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text("Estimated: $delivery", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(fee, fontWeight = FontWeight.Bold, color = Orange500, fontSize = 16.sp)
        }
    }
}

// ── Step 3: Payment ─────────────────────────────────────────────────────

@Composable
private fun PaymentStep(state: CheckoutUiState, viewModel: CheckoutViewModel) {
    Column(
        Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Select Payment Method", fontWeight = FontWeight.Bold, fontSize = 18.sp)

        state.paymentGateways.forEach { gw ->
            val isSelected = state.selectedGateway == gw.gatewayName
            OutlinedCard(
                onClick = { viewModel.selectGateway(gw.gatewayName ?: "") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) Orange500 else MaterialTheme.colorScheme.outline),
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(selected = isSelected, onClick = { viewModel.selectGateway(gw.gatewayName ?: "") }, colors = RadioButtonDefaults.colors(selectedColor = Orange500))
                    Spacer(Modifier.width(8.dp))
                    Icon(
                        when (gw.gatewayName) {
                            "stripe" -> Icons.Default.CreditCard
                            "bkash" -> Icons.Default.PhoneAndroid
                            else -> Icons.Default.Payments
                        }, null, Modifier.size(24.dp), tint = Orange500,
                    )
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(gw.displayName ?: gw.gatewayName ?: "", fontWeight = FontWeight.Bold)
                        Text(
                            if (gw.paymentType == "online") "Pay now securely" else "Pay when you receive",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        // Coupon section
        Text("Coupon Code", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = state.couponCode,
                onValueChange = { viewModel.setCoupon(it) },
                label = { Text("Enter coupon") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
            )
            Button(
                onClick = { /* TODO: validate coupon via API */ },
                modifier = Modifier.align(Alignment.CenterVertically),
                colors = ButtonDefaults.buttonColors(containerColor = Orange500),
            ) { Text("Apply") }
        }
    }
}

// ── Step 4: Review ──────────────────────────────────────────────────────

@Composable
private fun ReviewStep(state: CheckoutUiState, viewModel: CheckoutViewModel) {
    Column(
        Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Order Summary", fontWeight = FontWeight.Bold, fontSize = 18.sp)

        // Address card
        Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
            state.selectedAddress?.let { addr ->
                Row(Modifier.padding(12.dp)) {
                    Icon(Icons.Default.LocationOn, null, tint = Orange500)
                    Spacer(Modifier.width(8.dp))
                    Column {
                        Text(addr.recipientName, fontWeight = FontWeight.Bold)
                        Text(addr.fullAddress, style = MaterialTheme.typography.bodySmall)
                        Text("${addr.cityName} • ${addr.phone}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }

        // Shipping + Payment row
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Card(Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                Column(Modifier.padding(12.dp)) {
                    Icon(Icons.Default.LocalShipping, null, tint = Orange500, modifier = Modifier.size(20.dp))
                    Text(state.selectedShipping.replaceFirstChar { it.uppercase() }, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(state.estimatedDelivery, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Card(Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                Column(Modifier.padding(12.dp)) {
                    Icon(Icons.Default.Payment, null, tint = Orange500, modifier = Modifier.size(20.dp))
                    Text(state.selectedGateway.replaceFirstChar { it.uppercase() }, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(if (state.selectedGateway == "cod") "Pay on delivery" else "Online payment", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        // Items
        Text("Items (${state.cartItems.size})", fontWeight = FontWeight.SemiBold)
        state.cartItems.forEach { item ->
            Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = item.image, contentDescription = null,
                        modifier = Modifier.size(56.dp).clip(RoundedCornerShape(8.dp)),
                        contentScale = ContentScale.Crop,
                    )
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(item.productName, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), maxLines = 1)
                        Text("Qty: ${item.quantity}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text("${state.currencySymbol}${(item.sellingPrice * item.quantity).toInt()}", fontWeight = FontWeight.Bold, color = Orange500)
                }
            }
        }

        // Order Note
        OutlinedTextField(
            value = state.orderNote,
            onValueChange = { viewModel.setOrderNote(it) },
            label = { Text("Order Note (optional)") },
            placeholder = { Text("Special instructions for delivery...") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            minLines = 2,
            maxLines = 4,
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
        )
    }
}

// ── Order Success ───────────────────────────────────────────────────────

@Composable
private fun OrderSuccessScreen(onContinue: () -> Unit) {
    // Entry animation
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        AnimatedVisibility(
            visible = visible,
            enter = fadeIn(animationSpec = tween(600)) + scaleIn(
                initialScale = 0.8f,
                animationSpec = tween(600, easing = FastOutSlowInEasing)
            ),
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Spacer(Modifier.height(32.dp))

                // ── Animated checkmark circle ───────────────────────────
                Box(contentAlignment = Alignment.Center) {
                    // Outer glow ring
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = Color(0xFF4CAF50).copy(alpha = 0.15f),
                        modifier = Modifier.size(130.dp),
                    ) {}
                    // Inner glow
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = Color(0xFF4CAF50).copy(alpha = 0.3f),
                        modifier = Modifier.size(105.dp),
                    ) {}
                    // Inner solid circle
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = Color(0xFF4CAF50),
                        modifier = Modifier.size(80.dp),
                        shadowElevation = 12.dp,
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.Check, null,
                                Modifier.size(44.dp),
                                tint = Color.White
                            )
                        }
                    }
                }

                Spacer(Modifier.height(32.dp))

                // ── Title ───────────────────────────────────────────────
                Text(
                    "Order Confirmed! 🎉",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = (-0.5).sp,
                    ),
                    color = MaterialTheme.colorScheme.onBackground,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )

                Spacer(Modifier.height(12.dp))

                Text(
                    "Thank you for shopping with us.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )

                Spacer(Modifier.height(36.dp))

                // ── Info card ───────────────────────────────────────────
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    ),
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Orange500.copy(alpha = 0.15f),
                                modifier = Modifier.size(48.dp),
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(Icons.Default.LocalShipping, null, Modifier.size(24.dp), tint = Orange500)
                                }
                            }
                            Spacer(Modifier.width(16.dp))
                            Column {
                                Text("Estimated Delivery", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface)
                                Spacer(Modifier.height(2.dp))
                                Text("Within 2-5 business days", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f), modifier = Modifier.padding(vertical = 4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFF4CAF50).copy(alpha = 0.15f),
                                modifier = Modifier.size(48.dp),
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(Icons.Default.NotificationsActive, null, Modifier.size(24.dp), tint = Color(0xFF4CAF50))
                                }
                            }
                            Spacer(Modifier.width(16.dp))
                            Column {
                                Text("Order Updates", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface)
                                Spacer(Modifier.height(2.dp))
                                Text("You'll receive notifications soon", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }

                Spacer(Modifier.height(40.dp))

                // ── Primary Button ──────────────────────────────────────
                Button(
                    onClick = onContinue,
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Orange500),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp),
                ) {
                    Icon(Icons.Default.Home, null, Modifier.size(20.dp))
                    Spacer(Modifier.width(10.dp))
                    Text("Continue Shopping", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                Spacer(Modifier.height(16.dp))
            }
        }
    }
}
