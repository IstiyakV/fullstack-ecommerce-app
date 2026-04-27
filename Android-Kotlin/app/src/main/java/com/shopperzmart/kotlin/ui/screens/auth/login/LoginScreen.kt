package com.shopperzmart.kotlin.ui.screens.auth.login

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Constants
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.usecase.GoogleSignInUseCase
import com.shopperzmart.kotlin.domain.usecase.LoginUseCase
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class LoginState {
    object Idle    : LoginState()
    object Loading : LoginState()
    object Success : LoginState()
    data class Error(val message: String) : LoginState()
}

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val googleSignInUseCase: GoogleSignInUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow<LoginState>(LoginState.Idle)
    val state: StateFlow<LoginState> = _state

    fun login(phone: String, password: String) {
        viewModelScope.launch {
            _state.value = LoginState.Loading
            _state.value = when (val r = loginUseCase(phone, password)) {
                is Result.Success -> LoginState.Success
                is Result.Error   -> LoginState.Error(r.message)
                else              -> LoginState.Idle
            }
        }
    }

    fun googleSignIn(idToken: String) {
        viewModelScope.launch {
            _state.value = LoginState.Loading
            _state.value = when (val r = googleSignInUseCase(idToken)) {
                is Result.Success -> LoginState.Success
                is Result.Error   -> LoginState.Error(r.message)
                else              -> LoginState.Idle
            }
        }
    }
}

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    onNavigateToForgot: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    var phone by remember { mutableStateOf("01700000000") }
    var password by remember { mutableStateOf("12345678") }
    var showPassword by remember { mutableStateOf(false) }
    val context = LocalContext.current

    LaunchedEffect(state) {
        if (state is LoginState.Success) onLoginSuccess()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Gradient header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.42f)
                .background(Brush.verticalGradient(listOf(Navy900, Navy800)))
        )

        Column(
            modifier            = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(56.dp))

            // Back arrow for dismissing (user got here via in-app navigation)
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
                IconButton(onClick = onLoginSuccess) {  // dismiss = treat as cancel
                    Icon(Icons.Default.Close, "Close", tint = Color.White.copy(alpha = 0.7f))
                }
            }

            // Branding
            Text("🛒", fontSize = 52.sp)
            Spacer(Modifier.height(4.dp))
            Text(
                text       = "Shopperz Mart",
                fontSize   = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                color      = Color.White,
            )
            Text(
                text  = "Sign in to continue",
                fontSize = 13.sp,
                color = Navy400,
            )

            Spacer(Modifier.height(28.dp))

            // Card
            Card(
                modifier  = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                shape     = RoundedCornerShape(24.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 12.dp),
                colors    = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column(
                    modifier            = Modifier.padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Text("Sign In", style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold))

                    OutlinedTextField(
                        value           = phone,
                        onValueChange   = { phone = it },
                        label           = { Text("Phone Number") },
                        leadingIcon     = { Icon(Icons.Default.Phone, null) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine      = true,
                        modifier        = Modifier.fillMaxWidth(),
                        shape           = RoundedCornerShape(12.dp),
                        colors          = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Orange500,
                            focusedLabelColor  = Orange500,
                        ),
                    )

                    OutlinedTextField(
                        value                = password,
                        onValueChange        = { password = it },
                        label                = { Text("Password") },
                        leadingIcon          = { Icon(Icons.Default.Lock, null) },
                        trailingIcon         = {
                            IconButton(onClick = { showPassword = !showPassword }) {
                                Icon(if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility, null)
                            }
                        },
                        visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions      = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine           = true,
                        modifier             = Modifier.fillMaxWidth(),
                        shape                = RoundedCornerShape(12.dp),
                        colors               = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Orange500,
                            focusedLabelColor  = Orange500,
                        ),
                    )

                    TextButton(
                        onClick  = onNavigateToForgot,
                        modifier = Modifier.align(Alignment.End),
                    ) { Text("Forgot Password?", color = Orange500) }

                    if (state is LoginState.Error) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                            shape  = RoundedCornerShape(8.dp),
                        ) {
                            Text(
                                text     = (state as LoginState.Error).message,
                                color    = MaterialTheme.colorScheme.onErrorContainer,
                                style    = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            )
                        }
                    }

                    Button(
                        onClick  = { viewModel.login(phone, password) },
                        enabled  = state !is LoginState.Loading,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape    = RoundedCornerShape(12.dp),
                        colors   = ButtonDefaults.buttonColors(containerColor = Orange500),
                    ) {
                        if (state is LoginState.Loading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        } else {
                            Text("Sign In", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }

                    // ── Divider with "OR" ───────────────────────────────────
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        HorizontalDivider(modifier = Modifier.weight(1f))
                        Text(
                            text     = "  OR  ",
                            color    = MaterialTheme.colorScheme.onSurfaceVariant,
                            style    = MaterialTheme.typography.labelSmall,
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f))
                    }

                    // ── Google Sign-In Button ───────────────────────────────
                    OutlinedButton(
                        onClick  = {
                            // TODO: When Firebase is configured, launch CredentialManager here.
                            // For now, show a placeholder message.
                            // Example integration:
                            // val credentialManager = CredentialManager.create(context)
                            // val googleIdOption = GetGoogleIdOption.Builder()
                            //     .setServerClientId(Constants.GOOGLE_WEB_CLIENT_ID)
                            //     .setFilterByAuthorizedAccounts(false)
                            //     .build()
                            // val request = GetCredentialRequest.Builder()
                            //     .addCredentialOption(googleIdOption)
                            //     .build()
                            // val result = credentialManager.getCredential(context as Activity, request)
                            // val idToken = GoogleIdTokenCredential.createFrom(result.credential.data).idToken
                            // viewModel.googleSignIn(idToken)
                        },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape    = RoundedCornerShape(12.dp),
                        border   = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text("G", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4285F4))
                            Text(
                                "Sign in with Google",
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }

                    Row(
                        modifier              = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Text("Don't have an account?", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        TextButton(onClick = onNavigateToRegister) {
                            Text("Sign Up", color = Orange500, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}
