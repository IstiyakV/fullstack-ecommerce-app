package com.shopperzmart.kotlin.ui.screens.home.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.shopperzmart.kotlin.domain.model.Slider
import com.shopperzmart.kotlin.ui.theme.Orange500

/**
 * Auto-cycling banner slider using the native Compose Foundation Pager.
 * (Replaces deprecated Accompanist Pager.)
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun BannerSliderCompose(
    sliders: List<Slider>,
    modifier: Modifier = Modifier,
) {
    if (sliders.isEmpty()) return

    val pagerState = rememberPagerState(pageCount = { sliders.size })

    // Auto-scroll every 4 seconds, resets when user interacts
    LaunchedEffect(pagerState) {
        snapshotFlow { pagerState.currentPage }.collect {
            kotlinx.coroutines.delay(4000)
            val next = (pagerState.currentPage + 1) % sliders.size
            pagerState.animateScrollToPage(next)
        }
    }

    Box(modifier = modifier) {
        HorizontalPager(
            state    = pagerState,
            modifier = Modifier.fillMaxSize(),
            userScrollEnabled = true,
        ) { page ->
            AsyncImage(
                model              = sliders[page].sliderImage,
                contentDescription = sliders[page].sliderTitle,
                contentScale       = ContentScale.Crop,
                modifier           = Modifier.fillMaxSize(),
            )
        }

        // Custom dot indicator
        PagerDotsIndicator(
            pageCount    = sliders.size,
            currentPage  = pagerState.currentPage,
            modifier     = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 14.dp),
        )
    }
}

@Composable
fun PagerDotsIndicator(
    pageCount: Int,
    currentPage: Int,
    modifier: Modifier = Modifier,
    activeColor: Color = Orange500,
    inactiveColor: Color = Color.White.copy(alpha = 0.5f),
    dotSize: Dp = 8.dp,
    activeWidth: Dp = 20.dp,
    spacing: Dp = 5.dp,
) {
    Row(
        modifier            = modifier,
        horizontalArrangement = Arrangement.spacedBy(spacing),
        verticalAlignment   = Alignment.CenterVertically,
    ) {
        repeat(pageCount) { index ->
            val isActive = index == currentPage
            val width by animateDpAsState(
                targetValue   = if (isActive) activeWidth else dotSize,
                animationSpec = spring(stiffness = Spring.StiffnessMedium),
                label         = "dot_width",
            )
            Box(
                modifier = Modifier
                    .height(dotSize)
                    .width(width)
                    .clip(RoundedCornerShape(50))
                    .background(if (isActive) activeColor else inactiveColor)
            )
        }
    }
}
