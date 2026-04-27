package com.shopperzmart.kotlin.ui.screens.home.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.domain.model.Product
import com.shopperzmart.kotlin.ui.theme.*

@Composable
fun ProductCard(
    product: Product,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isWishlisted: Boolean = false,
    onWishlistToggle: (() -> Unit)? = null,
) {
    val discountInt = product.discountRate.toIntOrNull() ?: 0

    Card(
        onClick    = onClick,
        modifier   = modifier
            .width(170.dp)
            .shadow(elevation = 4.dp, shape = RoundedCornerShape(16.dp)),
        shape      = RoundedCornerShape(16.dp),
        colors     = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column {
            // ── Image section ────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
            ) {
                AsyncImage(
                    model   = product.featuredImage,
                    contentDescription = product.productName,
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier.fillMaxSize(),
                )
                // Gradient overlays
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(GradientStart, GradientEnd),
                                startY = 80f,
                            )
                        )
                )
                // Discount badge
                if (discountInt > 0) {
                    Box(
                        modifier = Modifier
                            .padding(8.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Orange500)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                            .align(Alignment.TopStart),
                    ) {
                        Text(
                            text  = "-$discountInt%",
                            color = Color.White,
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        )
                    }
                }
                // Rating badge bottom-right
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.Black.copy(alpha = 0.5f))
                        .padding(horizontal = 6.dp, vertical = 3.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp),
                ) {
                    Icon(Icons.Default.Star, null, tint = StarYellow, modifier = Modifier.size(10.dp))
                    Text(
                        text  = product.productRating,
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall,
                    )
                }

                // Wishlist heart
                if (onWishlistToggle != null) {
                    IconButton(
                        onClick = onWishlistToggle,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(6.dp)
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.85f)),
                    ) {
                        Icon(
                            if (isWishlisted) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Wishlist",
                            tint = if (isWishlisted) Color.Red else Color.Gray,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                }
            }

            // ── Text section (fixed height for alignment) ────────────────────
            Column(
                modifier = Modifier.padding(10.dp).height(72.dp),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text     = product.productName,
                    style    = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    color    = MaterialTheme.colorScheme.onSurface,
                )
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text  = "৳${product.sellingPrice.toInt()}",
                            style = MaterialTheme.typography.titleSmall.copy(color = Orange500),
                        )
                        if (discountInt > 0) {
                            Text(
                                text  = "৳${product.regularPrice.toInt()}",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textDecoration = TextDecoration.LineThrough,
                                ),
                            )
                        }
                    }
                    Text(
                        text  = product.shopName,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}

@Composable
fun ProductCardGrid(
    product: Product,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val discountInt = product.discountRate.toIntOrNull() ?: 0
    Card(
        onClick  = onClick,
        modifier = modifier.shadow(elevation = 2.dp, shape = RoundedCornerShape(12.dp)),
        shape    = RoundedCornerShape(12.dp),
        colors   = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column {
            Box(modifier = Modifier.fillMaxWidth().aspectRatio(1f)) {
                AsyncImage(
                    model = product.featuredImage,
                    contentDescription = product.productName,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
                Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(GradientStart, GradientEnd.copy(alpha = 0.6f)), startY = 60f)))
                if (discountInt > 0) {
                    Box(
                        modifier = Modifier.padding(6.dp).clip(RoundedCornerShape(4.dp))
                            .background(Orange500).padding(horizontal = 5.dp, vertical = 2.dp).align(Alignment.TopStart)
                    ) { Text("-$discountInt%", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold) }
                }
            }
            Column(modifier = Modifier.padding(8.dp)) {
                Text(product.productName, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold), maxLines = 2, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(2.dp))
                Text("৳${product.sellingPrice.toInt()}", style = MaterialTheme.typography.labelMedium.copy(color = Orange500, fontWeight = FontWeight.Bold))
            }
        }
    }
}
