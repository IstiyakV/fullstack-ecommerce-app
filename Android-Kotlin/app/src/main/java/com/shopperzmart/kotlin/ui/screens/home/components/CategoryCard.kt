package com.shopperzmart.kotlin.ui.screens.home.components

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.domain.model.Category
import com.shopperzmart.kotlin.ui.theme.*

@Composable
fun CategoryChip(
    category: Category,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clickable(onClick = onClick)
            .width(72.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        // Circular image with gradient ring
        Box(
            modifier = Modifier
                .size(62.dp)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(listOf(Orange500, Teal500))
                )
                .padding(2.dp)
        ) {
            AsyncImage(
                model            = category.featuredImage,
                contentDescription = category.parentCategoryNameEn,
                contentScale     = ContentScale.Crop,
                modifier         = Modifier.fillMaxSize().clip(CircleShape),
            )
        }
        Text(
            text      = category.parentCategoryNameEn,
            style     = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
            textAlign = TextAlign.Center,
            maxLines  = 2,
            overflow  = TextOverflow.Ellipsis,
            color     = MaterialTheme.colorScheme.onBackground,
        )
    }
}

@Composable
fun CategoryCardGrid(
    category: Category,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick  = onClick,
        modifier = modifier.shadow(2.dp, RoundedCornerShape(12.dp)),
        shape    = RoundedCornerShape(12.dp),
        colors   = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column {
            Box(modifier = Modifier.fillMaxWidth().aspectRatio(1f)) {
                AsyncImage(
                    model = category.featuredImage,
                    contentDescription = category.parentCategoryNameEn,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
                Box(
                    modifier = Modifier.fillMaxSize()
                        .background(Brush.verticalGradient(listOf(GradientStart, GradientEnd.copy(alpha = 0.7f)), startY = 50f))
                )
                Text(
                    text = category.parentCategoryNameEn,
                    style = MaterialTheme.typography.labelMedium.copy(color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.Bold),
                    modifier = Modifier.align(Alignment.BottomStart).padding(8.dp),
                )
            }
        }
    }
}
