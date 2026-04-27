package com.shopperzmart.kotlin.ui.screens.address

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.data.remote.dto.CityDto
import com.shopperzmart.kotlin.domain.model.Address
import com.shopperzmart.kotlin.domain.usecase.*
import com.shopperzmart.kotlin.ui.theme.Orange500
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

// ── ViewModel ───────────────────────────────────────────────────────────

data class AddressUiState(
    val addresses: List<Address> = emptyList(),
    val cities: List<CityDto> = emptyList(),
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val message: String? = null,
)

@HiltViewModel
class AddressViewModel @Inject constructor(
    private val getAddressesUseCase: GetAddressesUseCase,
    private val saveAddressUseCase: SaveAddressUseCase,
    private val deleteAddressUseCase: DeleteAddressUseCase,
    private val getCitiesUseCase: GetCitiesUseCase,
    private val prefs: UserPreferences,
) : ViewModel() {
    private val _state = MutableStateFlow(AddressUiState())
    val state: StateFlow<AddressUiState> = _state

    init { load() }

    fun load() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true)
        val userKey = prefs.userKey.first()

        // Load cities + addresses in parallel
        val citiesResult = getCitiesUseCase()
        val addrResult = getAddressesUseCase(userKey)

        _state.value = _state.value.copy(
            isLoading = false,
            cities = (citiesResult as? Result.Success)?.data ?: emptyList(),
            addresses = (addrResult as? Result.Success)?.data ?: emptyList(),
        )
    }

    fun saveAddress(
        recipientName: String, phone: String, fullAddress: String,
        cityId: String, cityName: String, postalCode: String, label: String, isDefault: Boolean,
    ) = viewModelScope.launch {
        _state.value = _state.value.copy(isSaving = true, message = null)
        val userKey = prefs.userKey.first()
        val body = mapOf(
            "customer_id" to userKey,
            "recipient_name" to recipientName,
            "phone" to phone,
            "full_address" to fullAddress,
            "city_id" to cityId,
            "city_name" to cityName,
            "postal_code" to postalCode,
            "label" to label,
            "is_default" to if (isDefault) "1" else "0",
        )
        when (val result = saveAddressUseCase(body)) {
            is Result.Success -> {
                _state.value = _state.value.copy(isSaving = false, message = "Address saved!")
                load()
            }
            is Result.Error -> _state.value = _state.value.copy(isSaving = false, message = result.message)
            else -> _state.value = _state.value.copy(isSaving = false)
        }
    }

    fun deleteAddress(addressId: String) = viewModelScope.launch {
        deleteAddressUseCase(addressId)
        load()
    }
}

// ── Address List Screen ─────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressListScreen(
    onNavigateBack: () -> Unit,
    onAddAddress: () -> Unit,
    viewModel: AddressViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val lifecycleOwner = androidx.compose.ui.platform.LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                viewModel.load()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Addresses", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAddAddress,
                containerColor = Orange500,
                contentColor = MaterialTheme.colorScheme.onPrimary,
            ) {
                Icon(Icons.Default.Add, null)
                Spacer(Modifier.width(8.dp))
                Text("Add Address")
            }
        },
    ) { padding ->
        if (state.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Orange500)
            }
        } else if (state.addresses.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.LocationOn, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.outline)
                    Spacer(Modifier.height(12.dp))
                    Text("No saved addresses", style = MaterialTheme.typography.titleMedium)
                    Text("Add a delivery address to get started", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            Column(
                modifier = Modifier.padding(padding).padding(horizontal = 16.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Spacer(Modifier.height(4.dp))
                state.addresses.forEach { addr ->
                    AddressCard(
                        address = addr,
                        onDelete = { viewModel.deleteAddress(addr.addressId) },
                    )
                }
                Spacer(Modifier.height(80.dp)) // space for FAB
            }
        }
    }
}

@Composable
private fun AddressCard(address: Address, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(4.dp),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Icon(
                imageVector = when (address.label.lowercase()) {
                    "office" -> Icons.Default.Business
                    else -> Icons.Default.Home
                },
                contentDescription = null,
                tint = Orange500,
                modifier = Modifier.size(32.dp),
            )
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(address.recipientName.ifBlank { "—" }, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.width(8.dp))
                    AssistChip(
                        onClick = {},
                        label = { Text(address.label.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.labelSmall) },
                    )
                    if (address.isDefault) {
                        Spacer(Modifier.width(8.dp))
                        AssistChip(
                            onClick = {},
                            label = { Text("Default", style = MaterialTheme.typography.labelSmall) },
                            colors = AssistChipDefaults.assistChipColors(containerColor = Orange500.copy(alpha = 0.1f), labelColor = Orange500),
                            border = AssistChipDefaults.assistChipBorder(borderColor = Color.Transparent, enabled = true)
                        )
                    }
                }
                Text(address.fullAddress, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("${address.cityName} • ${address.phone}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, null, tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}

// ── Add Address Screen ──────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddAddressScreen(
    onNavigateBack: () -> Unit,
    viewModel: AddressViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    var recipientName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var fullAddress by remember { mutableStateOf("") }
    var postalCode by remember { mutableStateOf("") }
    var label by remember { mutableStateOf("home") }
    var selectedCity by remember { mutableStateOf<CityDto?>(null) }
    var cityExpanded by remember { mutableStateOf(false) }
    var citySearch by remember { mutableStateOf("") }
    var isDefault by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(state.message) {
        state.message?.let {
            snackbarHostState.showSnackbar(it)
            if (it == "Address saved!") onNavigateBack()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Address", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(horizontal = 24.dp)
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Spacer(Modifier.height(4.dp))

            Icon(Icons.Default.LocationOn, null, Modifier.size(48.dp).align(Alignment.CenterHorizontally), tint = Orange500)
            Text("Add a delivery address", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), modifier = Modifier.align(Alignment.CenterHorizontally))

            Spacer(Modifier.height(8.dp))

            OutlinedTextField(
                value = recipientName, onValueChange = { recipientName = it },
                label = { Text("Recipient Name") },
                leadingIcon = { Icon(Icons.Default.Person, null) },
                modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
            )

            OutlinedTextField(
                value = phone, onValueChange = { phone = it },
                label = { Text("Phone Number") },
                leadingIcon = { Icon(Icons.Default.Phone, null) },
                modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
            )

            OutlinedTextField(
                value = fullAddress, onValueChange = { fullAddress = it },
                label = { Text("Full Address") },
                leadingIcon = { Icon(Icons.Default.Home, null) },
                modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                minLines = 2,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
            )

            // City Dropdown
            ExposedDropdownMenuBox(
                expanded = cityExpanded,
                onExpandedChange = { cityExpanded = it },
            ) {
                OutlinedTextField(
                    value = selectedCity?.cityName ?: "",
                    onValueChange = { citySearch = it },
                    label = { Text("City / District") },
                    leadingIcon = { Icon(Icons.Default.LocationCity, null) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = cityExpanded) },
                    readOnly = true,
                    modifier = Modifier.fillMaxWidth().menuAnchor(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
                )
                ExposedDropdownMenu(
                    expanded = cityExpanded,
                    onDismissRequest = { cityExpanded = false },
                ) {
                    val filtered = if (citySearch.isBlank()) state.cities
                    else state.cities.filter { it.cityName?.contains(citySearch, ignoreCase = true) == true }

                    filtered.forEach { city ->
                        DropdownMenuItem(
                            text = { Text("${city.cityName} (${city.division})") },
                            onClick = {
                                selectedCity = city
                                cityExpanded = false
                            },
                        )
                    }
                }
            }

            OutlinedTextField(
                value = postalCode, onValueChange = { postalCode = it },
                label = { Text("Postal Code (optional)") },
                leadingIcon = { Icon(Icons.Default.MailOutline, null) },
                modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
            )

            // Label selector
            Text("Address Label", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("home" to Icons.Default.Home, "office" to Icons.Default.Business).forEach { (lbl, icon) ->
                    FilterChip(
                        selected = label == lbl,
                        onClick = { label = lbl },
                        label = { Text(lbl.replaceFirstChar { it.uppercase() }) },
                        leadingIcon = { Icon(icon, null, Modifier.size(18.dp)) },
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            // Default Address Switch
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Set as default address", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                    Text("Use this address automatically", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Switch(
                    checked = isDefault,
                    onCheckedChange = { isDefault = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Orange500)
                )
            }

            Spacer(Modifier.weight(1f))

            Button(
                onClick = {
                    viewModel.saveAddress(
                        recipientName = recipientName,
                        phone = phone,
                        fullAddress = fullAddress,
                        cityId = selectedCity?.cityId?.toString() ?: "",
                        cityName = selectedCity?.cityName ?: "",
                        postalCode = postalCode,
                        label = label,
                        isDefault = isDefault,
                    )
                },
                enabled = !state.isSaving && recipientName.isNotBlank() && phone.isNotBlank() && fullAddress.isNotBlank() && selectedCity != null,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Orange500),
            ) {
                if (state.isSaving) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text("Save Address", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
