package com.shopperzmart.kotlin.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ── Light color scheme ────────────────────────────────────────────────────────
private val LightColorScheme = lightColorScheme(
    primary            = Orange500,
    onPrimary          = Color.White,
    primaryContainer   = Orange400,
    secondary          = Teal500,
    onSecondary        = Color.White,
    secondaryContainer = Teal400,
    background         = Navy50,
    onBackground       = Navy900,
    surface            = CardLight,
    onSurface          = Navy900,
    surfaceVariant     = SurfaceLight,
    onSurfaceVariant   = Navy700,
    error              = Error,
    onError            = Color.White,
    outline            = Navy200,
)

// ── Dark color scheme ────────────────────────────────────────────────────────
private val DarkColorScheme = darkColorScheme(
    primary            = Orange500,
    onPrimary          = Color.White,
    primaryContainer   = Orange600,
    secondary          = Teal400,
    onSecondary        = Navy900,
    secondaryContainer = Teal600,
    background         = Navy900,
    onBackground       = Navy50,
    surface            = Navy800,
    onSurface          = Navy50,
    surfaceVariant     = Navy700,
    onSurfaceVariant   = Navy200,
    error              = Error,
    onError            = Color.White,
    outline            = Navy600,
)

/**
 * App theme. Status/nav bar tinting handled by enableEdgeToEdge() in MainActivity.
 * Removed Accompanist SystemUiController (deprecated in 0.34.0).
 */
@Composable
fun ShopperzMartTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography   = ShopperzMartTypography,
        shapes       = ShopperzMartShapes,
        content      = content
    )
}


