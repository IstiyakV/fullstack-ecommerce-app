package com.shopperzmart.kotlin.ui.screens.product_list

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.Category
import com.shopperzmart.kotlin.domain.model.Product
import com.shopperzmart.kotlin.domain.usecase.FilterProductsUseCase
import com.shopperzmart.kotlin.domain.usecase.GetHomeFeedUseCase
import com.shopperzmart.kotlin.ui.screens.home.components.ProductCardGrid
import com.shopperzmart.kotlin.ui.common.ShimmerProductGrid
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProductListViewModel @Inject constructor(
    private val filterUseCase: FilterProductsUseCase,
    private val getHomeFeed: GetHomeFeedUseCase,
) : ViewModel() {
    val products = MutableStateFlow<List<Product>>(emptyList())
    val loading  = MutableStateFlow(false)
    val hasMore  = MutableStateFlow(false)
    val categories = MutableStateFlow<List<Category>>(emptyList())
    val totalCount = MutableStateFlow(0)

    private var currentFilter = ""
    var currentSort = ""
    var selectedCategoryId by mutableStateOf("")
    var priceMin by mutableStateOf("")
    var priceMax by mutableStateOf("")
    private var currentPage = 1
    private val perPage = 20

    fun loadCategories() = viewModelScope.launch {
        when (val r = getHomeFeed()) {
            is Result.Success -> categories.value = r.data.categories
            else -> {}
        }
    }

    fun load(filter: String, sort: String = currentSort, resetPage: Boolean = true) = viewModelScope.launch {
        currentFilter = filter
        currentSort = sort
        if (resetPage) { currentPage = 1; loading.value = true }

        val filterMap = mutableMapOf<String, String>("page" to currentPage.toString(), "per_page" to perPage.toString())
        if (filter.startsWith("cat_")) filterMap["product_category_id"] = filter.removePrefix("cat_")
        else when (filter) {
            "new_arrivals" -> filterMap["is_new_arrivals"] = "1"
            "hot_deals"    -> filterMap["is_hot_deals"] = "1"
            "gadgets"      -> filterMap["is_gadgets"] = "1"
            "popular"      -> filterMap["is_popular"] = "1"
        }
        if (sort.isNotBlank()) filterMap["sort_by"] = sort
        if (selectedCategoryId.isNotBlank()) filterMap["product_category_id"] = selectedCategoryId
        if (priceMin.isNotBlank()) filterMap["price_min"] = priceMin
        if (priceMax.isNotBlank()) filterMap["price_max"] = priceMax

        when (val r = filterUseCase(filterMap)) {
            is Result.Success -> {
                val newProducts = if (resetPage) r.data else products.value + r.data
                products.value = newProducts
                totalCount.value = newProducts.size
                hasMore.value = r.data.size >= perPage
            }
            else -> {}
        }
        loading.value = false
    }

    fun loadMore() {
        if (loading.value || !hasMore.value) return
        currentPage++
        load(currentFilter, currentSort, resetPage = false)
    }

    fun applyFilters(filter: String) {
        load(filter)
    }

    fun clearFilters(filter: String) {
        selectedCategoryId = ""
        priceMin = ""
        priceMax = ""
        load(filter)
    }

    val hasActiveFilters: Boolean
        get() = selectedCategoryId.isNotBlank() || priceMin.isNotBlank() || priceMax.isNotBlank()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductListScreen(
    filter: String,
    onProductClick: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: ProductListViewModel = hiltViewModel(),
) {
    val products by viewModel.products.collectAsState()
    val loading  by viewModel.loading.collectAsState()
    val hasMore  by viewModel.hasMore.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val totalCount by viewModel.totalCount.collectAsState()

    var selectedSort by remember { mutableStateOf("") }
    var showFilterSheet by remember { mutableStateOf(false) }

    LaunchedEffect(filter) {
        viewModel.loadCategories()
        viewModel.load(filter)
    }

    val title = when {
        filter.startsWith("cat_") -> "Products"
        filter == "new_arrivals"  -> "New Arrivals"
        filter == "hot_deals"     -> "Hot Deals"
        filter == "gadgets"       -> "Gadgets"
        filter == "popular"       -> "Popular Products"
        else                      -> "All Products"
    }

    // â”€â”€ Filter Bottom Sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (showFilterSheet) {
        FilterBottomSheet(
            categories = categories,
            selectedCategoryId = viewModel.selectedCategoryId,
            priceMin = viewModel.priceMin,
            priceMax = viewModel.priceMax,
            onCategorySelect = { viewModel.selectedCategoryId = it },
            onPriceMinChange = { viewModel.priceMin = it },
            onPriceMaxChange = { viewModel.priceMax = it },
            onApply = {
                showFilterSheet = false
                viewModel.applyFilters(filter)
            },
            onClear = {
                viewModel.clearFilters(filter)
            },
            onDismiss = { showFilterSheet = false },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title, fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
                actions = {
                    // Filter button with badge
                    BadgedBox(
                        badge = {
                            if (viewModel.hasActiveFilters) {
                                Badge(containerColor = Orange500) { Text("!", fontSize = 10.sp) }
                            }
                        },
                    ) {
                        IconButton(onClick = { showFilterSheet = true }) {
                            Icon(Icons.Default.FilterList, "Filters")
                        }
                    }
                },
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Product count + active filters
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                if (!loading || products.isNotEmpty()) {
                    Text(
                        "$totalCount products found",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                // Active filter chips
                if (viewModel.hasActiveFilters) {
                    Spacer(Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        if (viewModel.selectedCategoryId.isNotBlank()) {
                            val catName = categories.find { it.parentCategoryId == viewModel.selectedCategoryId }
                                ?.parentCategoryNameEn ?: "Category"
                            InputChip(
                                selected = true,
                                onClick = { viewModel.selectedCategoryId = ""; viewModel.applyFilters(filter) },
                                label = { Text(catName) },
                                trailingIcon = { Icon(Icons.Default.Close, null, Modifier.size(14.dp)) },
                                colors = InputChipDefaults.inputChipColors(
                                    selectedContainerColor = Orange500.copy(alpha = 0.15f),
                                    selectedLabelColor = Orange500,
                                ),
                                shape = RoundedCornerShape(20.dp),
                            )
                        }
                        if (viewModel.priceMin.isNotBlank() || viewModel.priceMax.isNotBlank()) {
                            val priceLabel = "à§³${viewModel.priceMin.ifBlank { "0" }} - à§³${viewModel.priceMax.ifBlank { "âˆž" }}"
                            InputChip(
                                selected = true,
                                onClick = { viewModel.priceMin = ""; viewModel.priceMax = ""; viewModel.applyFilters(filter) },
                                label = { Text(priceLabel) },
                                trailingIcon = { Icon(Icons.Default.Close, null, Modifier.size(14.dp)) },
                                colors = InputChipDefaults.inputChipColors(
                                    selectedContainerColor = Orange500.copy(alpha = 0.15f),
                                    selectedLabelColor = Orange500,
                                ),
                                shape = RoundedCornerShape(20.dp),
                            )
                        }
                        // Clear all
                        TextButton(onClick = { viewModel.clearFilters(filter) }) {
                            Text("Clear All", color = Orange500, fontSize = 12.sp)
                        }
                    }
                }
            }

            // Sort chips row
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                val sortOptions = listOf(
                    "" to "All",
                    "newest" to "Newest",
                    "price_asc" to "Price â†‘",
                    "price_desc" to "Price â†“",
                    "rating" to "Top Rated",
                )
                sortOptions.forEach { (key, label) ->
                    FilterChip(
                        selected = selectedSort == key,
                        onClick = {
                            selectedSort = key
                            viewModel.load(filter, key)
                        },
                        label = { Text(label) },
                        leadingIcon = {
                            if (selectedSort == key) Icon(Icons.Default.Check, null, Modifier.size(14.dp))
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Orange500.copy(alpha = 0.15f),
                            selectedLabelColor = Orange500,
                            selectedLeadingIconColor = Orange500,
                        ),
                        shape = RoundedCornerShape(20.dp),
                    )
                }
            }

            // Product grid
            if (loading && products.isEmpty()) {
                ShimmerProductGrid()
            } else if (products.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Inventory2, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.outline)
                        Text("No products found", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(products) { p ->
                        ProductCardGrid(product = p, onClick = { onProductClick(p.productId) })
                    }

                    // Load more trigger
                    if (hasMore) {
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            LaunchedEffect(Unit) { viewModel.loadMore() }
                            Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(Modifier.size(24.dp), color = Orange500, strokeWidth = 2.dp)
                            }
                        }
                    }

                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }
        }
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Filter Bottom Sheet
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterBottomSheet(
    categories: List<Category>,
    selectedCategoryId: String,
    priceMin: String,
    priceMax: String,
    onCategorySelect: (String) -> Unit,
    onPriceMinChange: (String) -> Unit,
    onPriceMaxChange: (String) -> Unit,
    onApply: () -> Unit,
    onClear: () -> Unit,
    onDismiss: () -> Unit,
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
        containerColor = MaterialTheme.colorScheme.surface,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            // Header
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Filters", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
                TextButton(onClick = onClear) { Text("Clear All", color = Orange500) }
            }

            // Category section
            if (categories.isNotEmpty()) {
                Text("Category", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    // "All" option
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        RadioButton(
                            selected = selectedCategoryId.isBlank(),
                            onClick = { onCategorySelect("") },
                            colors = RadioButtonDefaults.colors(selectedColor = Orange500),
                        )
                        Text("All Categories", style = MaterialTheme.typography.bodyMedium)
                    }
                    categories.forEach { cat ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            RadioButton(
                                selected = selectedCategoryId == cat.parentCategoryId,
                                onClick = { onCategorySelect(cat.parentCategoryId) },
                                colors = RadioButtonDefaults.colors(selectedColor = Orange500),
                            )
                            Text(cat.parentCategoryNameEn, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }

            // Price range section
            Text("Price Range", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                OutlinedTextField(
                    value = priceMin,
                    onValueChange = { onPriceMinChange(it.filter { c -> c.isDigit() }) },
                    label = { Text("Min à§³") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = priceMax,
                    onValueChange = { onPriceMaxChange(it.filter { c -> c.isDigit() }) },
                    label = { Text("Max à§³") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                )
            }

            // Apply button
            Button(
                onClick = onApply,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Orange500),
            ) {
                Icon(Icons.Default.FilterList, null, Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Apply Filters", fontWeight = FontWeight.Bold)
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

