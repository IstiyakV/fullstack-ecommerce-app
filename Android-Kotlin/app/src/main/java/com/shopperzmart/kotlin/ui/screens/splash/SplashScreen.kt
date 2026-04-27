package com.shopperzmart.kotlin.ui.screens.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.Image
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.R
import com.shopperzmart.kotlin.ui.theme.Teal500
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Splash screen — always navigates to Home (Main) after the animation.
 * Login is lazily triggered only when the user attempts a protected action.
 */
@HiltViewModel
class SplashViewModel @Inject constructor() : ViewModel() {
    var ready by androidx.compose.runtime.mutableStateOf(false)
        private set

    init {
        viewModelScope.launch {
            delay(2000)
            ready = true
        }
    }
}

@Composable
fun SplashScreen(
    onNavigateToMain: () -> Unit,
    // kept for signature compatibility — splash no longer forces login
    onNavigateToLogin: () -> Unit = {},
    viewModel: SplashViewModel = hiltViewModel(),
) {
    val ready = viewModel.ready

    LaunchedEffect(ready) {
        if (ready) onNavigateToMain()
    }

    // ── Animation ────────────────────────────────────────────────────────────
    val infiniteTransition = rememberInfiniteTransition(label = "splash_pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue  = 0.95f,
        targetValue   = 1.02f,
        animationSpec = infiniteRepeatable(tween(1200, easing = EaseInOutCirc), RepeatMode.Reverse),
        label         = "scale_pulse",
    )
    var visible by remember { mutableStateOf(false) }
    val alpha by animateFloatAsState(
        targetValue   = if (visible) 1f else 0f,
        animationSpec = tween(700),
        label         = "fade_in",
    )
    LaunchedEffect(Unit) { visible = true }

    val colorTransition = rememberInfiniteTransition(label = "glowPulse")
    val glowAlpha by colorTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 0.4f,
        animationSpec = infiniteRepeatable(tween(2000, easing = LinearEasing), RepeatMode.Reverse),
        label = "glowAlpha"
    )

    // ── UI ───────────────────────────────────────────────────────────────────
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050505)), // Pure deep dark background
        contentAlignment = Alignment.Center,
    ) {
        // Animated background glow
        Box(
            modifier = Modifier
                .size(240.dp)
                .alpha(alpha * glowAlpha)
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFFFFB74D), Color.Transparent),
                        radius = 350f
                    ),
                    shape = CircleShape
                )
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.alpha(alpha).scale(scale),
        ) {
            // Refined logo rendering (No hardcoded clipping or background)
            Image(
                painter            = painterResource(id = R.drawable.splash_logo),
                contentDescription = "Shopperz Mart",
                modifier           = Modifier.size(150.dp),
            )
            
            Spacer(Modifier.height(32.dp))
            
            Text(
                text       = "SHOPPERZ MART",
                fontSize   = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                color      = Color.White,
                letterSpacing = 4.sp,
            )
            
            Spacer(Modifier.height(8.dp))
            
            Text(
                text      = "PREMIUM E-COMMERCE",
                fontSize  = 12.sp,
                fontWeight = FontWeight.Medium,
                color     = Color.White.copy(alpha = 0.7f),
                letterSpacing = 6.sp,
            )
        }
    }
}
