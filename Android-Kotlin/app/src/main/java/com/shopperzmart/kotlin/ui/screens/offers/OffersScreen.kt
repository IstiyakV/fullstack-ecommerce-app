package com.shopperzmart.kotlin.ui.screens.offers

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.shopperzmart.kotlin.ui.screens.home.HomeUiState
import com.shopperzmart.kotlin.ui.screens.home.HomeViewModel
import com.shopperzmart.kotlin.ui.screens.home.components.ProductCardGrid

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OffersScreen(
    onProductClick: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val products = when (val s = state) {
        is HomeUiState.Success -> s.feed.newArrivals + s.feed.hotDeals
        else -> emptyList()
    }
    Scaffold(topBar = { TopAppBar(title = { Text("Offers & Deals 🎉", fontWeight = FontWeight.Bold) }) }) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.padding(padding),
        ) {
            items(products) { p -> ProductCardGrid(product = p, onClick = { onProductClick(p.productId) }) }
        }
    }
}
