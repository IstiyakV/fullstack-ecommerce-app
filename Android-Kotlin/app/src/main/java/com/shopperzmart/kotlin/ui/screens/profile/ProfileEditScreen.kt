package com.shopperzmart.kotlin.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.domain.usecase.UpdateProfileUseCase
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

// ═══════════════════════════════════════════════════════════════════════
// ViewModel
// ═══════════════════════════════════════════════════════════════════════

@HiltViewModel
class ProfileEditViewModel @Inject constructor(
    private val updateProfileUseCase: UpdateProfileUseCase,
    private val prefs: UserPreferences,
) : ViewModel() {
    val userName  = prefs.userName.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "")
    val userPhone = prefs.userPhone.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "")
    val userEmail = prefs.userEmail.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "")

    var saving by mutableStateOf(false)
    var resultMsg by mutableStateOf<String?>(null)
    var isSuccess by mutableStateOf(false)

    fun save(name: String, email: String, phone: String) = viewModelScope.launch {
        saving = true
        when (val r = updateProfileUseCase(name, email, phone)) {
            is Result.Success -> { resultMsg = "Profile updated successfully!"; isSuccess = true }
            is Result.Error -> { resultMsg = r.message; isSuccess = false }
            else -> {}
        }
        saving = false
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Screen
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileEditScreen(
    onNavigateBack: () -> Unit,
    viewModel: ProfileEditViewModel = hiltViewModel(),
) {
    val currentName  by viewModel.userName.collectAsState()
    val currentPhone by viewModel.userPhone.collectAsState()
    val currentEmail by viewModel.userEmail.collectAsState()

    var name  by remember(currentName) { mutableStateOf(currentName) }
    var email by remember(currentEmail) { mutableStateOf(currentEmail) }
    var phone by remember(currentPhone) { mutableStateOf(currentPhone) }

    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(viewModel.resultMsg) {
        viewModel.resultMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.resultMsg = null
            if (viewModel.isSuccess) onNavigateBack()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize().verticalScroll(rememberScrollState()),
        ) {
            // ── Avatar Header ───────────────────────────────────────────
            Box(
                modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(
                        modifier = Modifier.size(88.dp).clip(CircleShape)
                            .background(Brush.linearGradient(listOf(Orange500, Teal500))),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = if (name.isNotEmpty()) name.first().uppercase() else "?",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                        )
                    }
                    Text("Tap to change photo", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            HorizontalDivider()

            // ── Form Fields ─────────────────────────────────────────────
            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                ProfileTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "Full Name",
                    icon = Icons.Default.Person,
                )
                ProfileTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = "Email",
                    icon = Icons.Default.Email,
                )
                ProfileTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = "Phone Number",
                    icon = Icons.Default.Phone,
                )

                Spacer(Modifier.height(8.dp))

                // ── Save Button ─────────────────────────────────────────
                Button(
                    onClick = { viewModel.save(name, email, phone) },
                    enabled = !viewModel.saving && (name != currentName || email != currentEmail || phone != currentPhone),
                    modifier = Modifier.fillMaxWidth().height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Orange500),
                ) {
                    if (viewModel.saving) {
                        CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                        Spacer(Modifier.width(8.dp))
                    }
                    Icon(Icons.Default.Check, null, Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Save Changes", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun ProfileTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: ImageVector,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        leadingIcon = { Icon(icon, null, tint = Orange500) },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        shape = RoundedCornerShape(14.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Orange500,
            focusedLabelColor = Orange500,
            cursorColor = Orange500,
        ),
    )
}
