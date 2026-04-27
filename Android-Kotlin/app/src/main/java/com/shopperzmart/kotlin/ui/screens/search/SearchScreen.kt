package com.shopperzmart.kotlin.ui.screens.search

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.Product
import com.shopperzmart.kotlin.domain.usecase.FilterProductsUseCase
import com.shopperzmart.kotlin.ui.screens.home.components.ProductCardGrid
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ═══════════════════════════════════════════════════════════════════════
// ViewModel
// ═══════════════════════════════════════════════════════════════════════

@HiltViewModel
class SearchViewModel @Inject constructor(private val filter: FilterProductsUseCase) : ViewModel() {
    val results = MutableStateFlow<List<Product>>(emptyList())
    val loading = MutableStateFlow(false)
    val totalCount = MutableStateFlow(0)
    val currentPage = MutableStateFlow(1)
    val hasMore = MutableStateFlow(false)

    var currentQuery = ""
    var currentSort = ""
    var currentPriceMin = ""
    var currentPriceMax = ""

    private var searchJob: Job? = null
    private val perPage = 20

    fun search(query: String, sort: String = currentSort, priceMin: String = currentPriceMin, priceMax: String = currentPriceMax, resetPage: Boolean = true) {
        searchJob?.cancel()
        currentQuery = query
        currentSort = sort
        currentPriceMin = priceMin
        currentPriceMax = priceMax

        if (query.isBlank() && priceMin.isBlank() && priceMax.isBlank()) {
            results.value = emptyList()
            totalCount.value = 0
            return
        }

        if (resetPage) currentPage.value = 1

        searchJob = viewModelScope.launch {
            if (resetPage) delay(400) // debounce only on fresh search
            loading.value = true

            val filters = mutableMapOf<String, String>(
                "page" to currentPage.value.toString(),
                "per_page" to perPage.toString(),
            )
            if (query.isNotBlank()) filters["search_query"] = query
            if (sort.isNotBlank()) filters["sort_by"] = sort
            if (priceMin.isNotBlank()) filters["price_min"] = priceMin
            if (priceMax.isNotBlank()) filters["price_max"] = priceMax

            when (val r = filter(filters)) {
                is Result.Success -> {
                    if (resetPage) {
                        results.value = r.data
                    } else {
                        results.value = results.value + r.data
                    }
                    // totalCount from paginated response isn't directly available through use case
                    // But we can infer from result size
                    hasMore.value = r.data.size >= perPage
                }
                else -> {}
            }
            loading.value = false
        }
    }

    fun loadMore() {
        if (loading.value || !hasMore.value) return
        currentPage.value++
        search(currentQuery, currentSort, currentPriceMin, currentPriceMax, resetPage = false)
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Screen
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onProductClick: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: SearchViewModel = hiltViewModel(),
) {
    var query by remember { mutableStateOf("") }
    val results by viewModel.results.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val hasMore by viewModel.hasMore.collectAsState()
    val focus = remember { FocusRequester() }

    var showFilters by remember { mutableStateOf(false) }
    var selectedSort by remember { mutableStateOf("") }
    var priceMin by remember { mutableStateOf("") }
    var priceMax by remember { mutableStateOf("") }

    LaunchedEffect(Unit) { focus.requestFocus() }

    // Filter bottom sheet
    if (showFilters) {
        FilterBottomSheet(
            currentSort = selectedSort,
            currentPriceMin = priceMin,
            currentPriceMax = priceMax,
            onApply = { sort, pMin, pMax ->
                selectedSort = sort
                priceMin = pMin
                priceMax = pMax
                showFilters = false
                viewModel.search(query, sort, pMin, pMax)
            },
            onDismiss = { showFilters = false },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
                title = {
                    OutlinedTextField(
                        value = query,
                        onValueChange = { query = it; viewModel.search(it, selectedSort, priceMin, priceMax) },
                        placeholder = { Text("Search products...") },
                        modifier = Modifier.fillMaxWidth().focusRequester(focus),
                        singleLine = true,
                        shape = RoundedCornerShape(24.dp),
                        leadingIcon = { Icon(Icons.Default.Search, null) },
                        trailingIcon = {
                            if (query.isNotEmpty()) IconButton(onClick = { query = ""; viewModel.search("") }) { Icon(Icons.Default.Clear, null) }
                        },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500),
                    )
                },
                actions = {
                    IconButton(onClick = { showFilters = true }) {
                        Badge(containerColor = if (selectedSort.isNotBlank() || priceMin.isNotBlank() || priceMax.isNotBlank()) Orange500 else MaterialTheme.colorScheme.surfaceVariant) {
                            Icon(Icons.Default.FilterList, "Filters")
                        }
                    }
                },
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Active filter chips
            if (selectedSort.isNotBlank() || priceMin.isNotBlank() || priceMax.isNotBlank()) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    if (selectedSort.isNotBlank()) {
                        FilterChip(
                            selected = true,
                            onClick = { selectedSort = ""; viewModel.search(query, "", priceMin, priceMax) },
                            label = { Text(sortLabel(selectedSort)) },
                            leadingIcon = { Icon(Icons.AutoMirrored.Filled.Sort, null, Modifier.size(16.dp)) },
                            trailingIcon = { Icon(Icons.Default.Close, null, Modifier.size(14.dp)) },
                        )
                    }
                    if (priceMin.isNotBlank() || priceMax.isNotBlank()) {
                        val priceText = when {
                            priceMin.isNotBlank() && priceMax.isNotBlank() -> "৳$priceMin - ৳$priceMax"
                            priceMin.isNotBlank() -> "From ৳$priceMin"
                            else -> "Up to ৳$priceMax"
                        }
                        FilterChip(
                            selected = true,
                            onClick = { priceMin = ""; priceMax = ""; viewModel.search(query, selectedSort, "", "") },
                            label = { Text(priceText) },
                            leadingIcon = { Icon(Icons.Default.AttachMoney, null, Modifier.size(16.dp)) },
                            trailingIcon = { Icon(Icons.Default.Close, null, Modifier.size(14.dp)) },
                        )
                    }
                }
            }

            // Results
            Box(modifier = Modifier.fillMaxSize()) {
                if (loading && results.isEmpty()) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Orange500) }
                } else if (results.isEmpty() && query.isNotEmpty()) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.SearchOff, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.outline)
                            Text("No results found for \"$query\"", color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Try adjusting your filters", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                } else if (results.isEmpty()) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.Search, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                            Text("Search for products", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Type a product name to get started", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(results) { p ->
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

                        // Bottom spacer
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            Spacer(Modifier.height(8.dp))
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Filter Bottom Sheet
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterBottomSheet(
    currentSort: String,
    currentPriceMin: String,
    currentPriceMax: String,
    onApply: (sort: String, priceMin: String, priceMax: String) -> Unit,
    onDismiss: () -> Unit,
) {
    var sort by remember { mutableStateOf(currentSort) }
    var pMin by remember { mutableStateOf(currentPriceMin) }
    var pMax by remember { mutableStateOf(currentPriceMax) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            // Title
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Filters & Sort", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
                TextButton(onClick = { sort = ""; pMin = ""; pMax = "" }) {
                    Text("Clear All", color = Error)
                }
            }

            // Sort Options
            Text("Sort By", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                val sortOptions = listOf(
                    "" to "Default",
                    "newest" to "Newest First",
                    "price_asc" to "Price: Low to High",
                    "price_desc" to "Price: High to Low",
                    "rating" to "Highest Rated",
                )
                sortOptions.forEach { (key, label) ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(
                            selected = sort == key,
                            onClick = { sort = key },
                            colors = RadioButtonDefaults.colors(selectedColor = Orange500),
                        )
                        Text(label, modifier = Modifier.weight(1f))
                        if (sort == key && key.isNotBlank()) {
                            Icon(Icons.Default.Check, null, Modifier.size(18.dp), tint = Orange500)
                        }
                    }
                }
            }

            HorizontalDivider()

            // Price Range
            Text("Price Range", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                OutlinedTextField(
                    value = pMin,
                    onValueChange = { pMin = it.filter { c -> c.isDigit() } },
                    label = { Text("Min ৳") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                )
                OutlinedTextField(
                    value = pMax,
                    onValueChange = { pMax = it.filter { c -> c.isDigit() } },
                    label = { Text("Max ৳") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                )
            }

            // Quick price buttons
            Row(
                modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf("Under ৳500" to ("" to "500"), "৳500-2000" to ("500" to "2000"), "৳2000-5000" to ("2000" to "5000"), "Over ৳5000" to ("5000" to "")).forEach { (label, range) ->
                    AssistChip(
                        onClick = { pMin = range.first; pMax = range.second },
                        label = { Text(label, style = MaterialTheme.typography.labelSmall) },
                        shape = RoundedCornerShape(20.dp),
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = if (pMin == range.first && pMax == range.second) Orange500.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant,
                        ),
                    )
                }
            }

            // Apply Button
            Button(
                onClick = { onApply(sort, pMin, pMax) },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Orange500),
            ) {
                Icon(Icons.Default.Check, null, Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Apply Filters", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

private fun sortLabel(sort: String): String = when (sort) {
    "newest" -> "Newest"
    "price_asc" -> "Price: Low→High"
    "price_desc" -> "Price: High→Low"
    "rating" -> "Top Rated"
    else -> "Sort"
}
