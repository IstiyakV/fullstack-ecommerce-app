package com.shopperzmart.kotlin.ui.common

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp

@Composable
fun ShimmerBox(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim = transition.animateFloat(
        initialValue = 0f,
        targetValue  = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "shimmerAnim"
    )
    val shimmerColors = listOf(
        MaterialTheme.colorScheme.surfaceVariant,
        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        MaterialTheme.colorScheme.surfaceVariant,
    )
    Box(
        modifier = modifier.background(
            brush = Brush.linearGradient(
                colors     = shimmerColors,
                start      = Offset(translateAnim.value - 500f, 0f),
                end        = Offset(translateAnim.value, 0f),
            ),
            shape = RoundedCornerShape(12.dp)
        )
    )
}

@Composable
fun ShimmerProductCard(modifier: Modifier = Modifier) {
    Column(modifier = modifier.width(160.dp)) {
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(180.dp))
        Spacer(Modifier.height(8.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth(0.8f).height(14.dp))
        Spacer(Modifier.height(4.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth(0.5f).height(12.dp))
    }
}

@Composable
fun ShimmerHomeFeed() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Banner
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(200.dp))
        Spacer(Modifier.height(20.dp))
        // Category row
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            repeat(5) {
                Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                    ShimmerBox(modifier = Modifier.size(62.dp))
                    Spacer(Modifier.height(4.dp))
                    ShimmerBox(modifier = Modifier.width(50.dp).height(10.dp))
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        // Product row
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            repeat(3) { ShimmerProductCard() }
        }
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Product Detail Shimmer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@Composable
fun ShimmerProductDetail() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Gallery placeholder
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(300.dp))
        Spacer(Modifier.height(16.dp))
        // Thumbnail row
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(4) {
                ShimmerBox(modifier = Modifier.size(60.dp))
            }
        }
        Spacer(Modifier.height(20.dp))
        // Title
        ShimmerBox(modifier = Modifier.fillMaxWidth(0.9f).height(20.dp))
        Spacer(Modifier.height(8.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth(0.6f).height(16.dp))
        Spacer(Modifier.height(12.dp))
        // Price row
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            ShimmerBox(modifier = Modifier.width(100.dp).height(24.dp))
            ShimmerBox(modifier = Modifier.width(80.dp).height(18.dp))
        }
        Spacer(Modifier.height(8.dp))
        // Rating
        ShimmerBox(modifier = Modifier.fillMaxWidth(0.35f).height(14.dp))
        Spacer(Modifier.height(20.dp))
        // Variant selectors
        ShimmerBox(modifier = Modifier.fillMaxWidth(0.3f).height(14.dp))
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(3) {
                ShimmerBox(modifier = Modifier.size(72.dp))
            }
        }
        Spacer(Modifier.height(20.dp))
        // Buttons
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(48.dp))
        Spacer(Modifier.height(8.dp))
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(48.dp))
        Spacer(Modifier.height(20.dp))
        // Description
        repeat(4) {
            ShimmerBox(modifier = Modifier.fillMaxWidth(if (it == 3) 0.5f else 1f).height(12.dp))
            Spacer(Modifier.height(6.dp))
        }
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Product Grid Shimmer (for ProductListScreen)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@Composable
fun ShimmerProductGrid(columns: Int = 2) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Sort chips placeholder
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(4) {
                ShimmerBox(modifier = Modifier.width(70.dp).height(32.dp))
            }
        }
        Spacer(Modifier.height(16.dp))
        // Grid
        repeat(3) { rowIdx ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                repeat(columns) {
                    Column(modifier = Modifier.weight(1f)) {
                        ShimmerBox(modifier = Modifier.fillMaxWidth().height(180.dp))
                        Spacer(Modifier.height(8.dp))
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.85f).height(14.dp))
                        Spacer(Modifier.height(4.dp))
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.5f).height(12.dp))
                        Spacer(Modifier.height(4.dp))
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.3f).height(12.dp))
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Order List Shimmer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@Composable
fun ShimmerOrderList() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        repeat(4) {
            ShimmerOrderCard()
        }
    }
}

@Composable
private fun ShimmerOrderCard() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        // Header row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            ShimmerBox(modifier = Modifier.width(120.dp).height(16.dp))
            ShimmerBox(modifier = Modifier.width(80.dp).height(24.dp))
        }
        // Date
        ShimmerBox(modifier = Modifier.width(100.dp).height(12.dp))
        // Item row
        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            ShimmerBox(modifier = Modifier.size(48.dp))
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.7f).height(14.dp))
                Spacer(Modifier.height(4.dp))
                ShimmerBox(modifier = Modifier.fillMaxWidth(0.4f).height(12.dp))
            }
        }
        // Total row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            ShimmerBox(modifier = Modifier.width(60.dp).height(14.dp))
            ShimmerBox(modifier = Modifier.width(80.dp).height(16.dp))
        }
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Cart Shimmer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@Composable
fun ShimmerCart() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        repeat(3) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                ShimmerBox(modifier = Modifier.size(72.dp))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    ShimmerBox(modifier = Modifier.fillMaxWidth(0.8f).height(14.dp))
                    Spacer(Modifier.height(6.dp))
                    ShimmerBox(modifier = Modifier.fillMaxWidth(0.4f).height(12.dp))
                    Spacer(Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ShimmerBox(modifier = Modifier.width(28.dp).height(28.dp))
                        ShimmerBox(modifier = Modifier.width(24.dp).height(14.dp))
                        ShimmerBox(modifier = Modifier.width(28.dp).height(28.dp))
                    }
                }
                ShimmerBox(modifier = Modifier.width(60.dp).height(16.dp))
            }
        }
        Spacer(Modifier.height(16.dp))
        // Total bar
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(52.dp))
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Order Detail Shimmer
// ═══════════════════════════════════════════════════════════════════════

@Composable
fun ShimmerOrderDetail() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Status header card
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(80.dp))
        // Timeline
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(3) {
                Row(
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    ShimmerBox(modifier = Modifier.size(14.dp))
                    Column(Modifier.weight(1f)) {
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.4f).height(14.dp))
                        Spacer(Modifier.height(4.dp))
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.25f).height(10.dp))
                    }
                }
            }
        }
        // Track button
        ShimmerBox(modifier = Modifier.fillMaxWidth().height(48.dp))
        // Items
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            repeat(2) {
                Row(
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    ShimmerBox(modifier = Modifier.size(64.dp))
                    Column(Modifier.weight(1f)) {
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.7f).height(14.dp))
                        Spacer(Modifier.height(4.dp))
                        ShimmerBox(modifier = Modifier.fillMaxWidth(0.4f).height(12.dp))
                    }
                    ShimmerBox(modifier = Modifier.width(60.dp).height(16.dp))
                }
            }
        }
        // Price summary
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(3) {
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    ShimmerBox(modifier = Modifier.width(80.dp).height(14.dp))
                    ShimmerBox(modifier = Modifier.width(60.dp).height(14.dp))
                }
            }
        }
    }
}
