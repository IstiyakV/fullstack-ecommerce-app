package com.shopperzmart.kotlin.ui.screens.categories

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.shopperzmart.kotlin.domain.model.Category
import com.shopperzmart.kotlin.ui.screens.home.HomeUiState
import com.shopperzmart.kotlin.ui.screens.home.HomeViewModel
import com.shopperzmart.kotlin.ui.screens.home.components.CategoryCardGrid

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesScreen(
    onProductClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()

    val categories: List<Category> = when (val s = state) {
        is HomeUiState.Success -> s.feed.categories
        else -> emptyList()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("All Categories", fontWeight = FontWeight.Bold) },
            )
        }
    ) { padding ->
        if (categories.isEmpty()) {
            Box(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentAlignment = androidx.compose.ui.Alignment.Center,
            ) {
                CircularProgressIndicator(color = com.shopperzmart.kotlin.ui.theme.Orange500)
            }
        } else {
            LazyVerticalGrid(
                columns             = GridCells.Fixed(3),
                contentPadding      = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier            = Modifier.padding(padding),
            ) {
                items(categories) { cat ->
                    CategoryCardGrid(
                        category = cat,
                        onClick  = { onCategoryClick("cat_${cat.parentCategoryId}") },
                        modifier = Modifier.aspectRatio(1f),
                    )
                }
            }
        }
    }
}
