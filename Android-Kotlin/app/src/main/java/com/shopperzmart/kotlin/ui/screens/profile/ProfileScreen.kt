package com.shopperzmart.kotlin.ui.screens.profile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.domain.usecase.LogoutUseCase
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val prefs: UserPreferences,
    private val logoutUseCase: LogoutUseCase,
) : ViewModel() {
    val isLoggedIn = prefs.isLoggedIn.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)
    val userName   = prefs.userName.stateIn(viewModelScope,   SharingStarted.WhileSubscribed(5000), "")
    val userPhone  = prefs.userPhone.stateIn(viewModelScope,  SharingStarted.WhileSubscribed(5000), "")

    fun logout() = viewModelScope.launch { logoutUseCase() }
}

@Composable
fun ProfileScreen(
    onLoginClick: () -> Unit,
    onOrdersClick: () -> Unit,
    onAddressClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onEditProfileClick: () -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val isLoggedIn by viewModel.isLoggedIn.collectAsState()
    val name  by viewModel.userName.collectAsState()
    val phone by viewModel.userPhone.collectAsState()
    val initial = if (name.isNotEmpty()) name.first().uppercase() else "?"

    Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {

        // ── Header ──────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(Navy900, Navy800)))
                .padding(24.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Row(
                    verticalAlignment     = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    // Avatar
                    Box(
                        modifier        = Modifier.size(72.dp).clip(CircleShape).background(Orange500),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text       = initial,
                            fontSize   = 30.sp,
                            fontWeight = FontWeight.Bold,
                            color      = Color.White,
                        )
                    }
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text       = if (isLoggedIn && name.isNotEmpty()) name else "Guest",
                            style      = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, color = Color.White),
                        )
                        Text(
                            text  = if (isLoggedIn) phone else "Tap below to sign in",
                            style = MaterialTheme.typography.bodySmall.copy(color = Navy400),
                        )
                    }
                }

                // Sign in button shown only when not logged in
                if (!isLoggedIn) {
                    Button(
                        onClick  = onLoginClick,
                        modifier = Modifier.fillMaxWidth(),
                        shape    = RoundedCornerShape(12.dp),
                        colors   = ButtonDefaults.buttonColors(containerColor = Orange500),
                    ) {
                        Icon(Icons.Default.Login, null, Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Sign In / Register", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        // ── Menu Items ───────────────────────────────────────────────────────
        if (isLoggedIn) {
            ProfileMenuItem(
                icon    = Icons.Default.Edit,
                label   = "Edit Profile",
                onClick = onEditProfileClick,
            )
        }
        ProfileMenuItem(
            icon    = Icons.Default.ShoppingBag,
            label   = "My Orders",
            onClick = { if (isLoggedIn) onOrdersClick() else onLoginClick() },
        )
        ProfileMenuItem(Icons.Default.LocationOn,  "My Addresses",  { if (isLoggedIn) onAddressClick() else onLoginClick() })
        ProfileMenuItem(Icons.Default.Favorite,    "Wishlist",      { onWishlistClick() })
        ProfileMenuItem(Icons.Default.Notifications, "Notifications", {})
        ProfileMenuItem(Icons.Default.Help,        "Help & Support", {})
        ProfileMenuItem(Icons.Default.Info,        "About Shopperz Mart", {})

        if (isLoggedIn) {
            Spacer(Modifier.height(8.dp))
            HorizontalDivider()
            ProfileMenuItem(
                icon          = Icons.Default.Logout,
                label         = "Sign Out",
                onClick       = { viewModel.logout() },
                isDestructive = true,
            )
        }

        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun ProfileMenuItem(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    isDestructive: Boolean = false,
) {
    ListItem(
        modifier        = Modifier.clickable(onClick = onClick),
        headlineContent = {
            Text(label, color = if (isDestructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
        },
        leadingContent  = {
            Icon(icon, null, tint = if (isDestructive) MaterialTheme.colorScheme.error else Orange500)
        },
        trailingContent = {
            if (!isDestructive) Icon(Icons.Default.ChevronRight, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        },
    )
    HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
}
