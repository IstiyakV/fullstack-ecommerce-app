package com.shopperzmart.kotlin.ui.screens.auth.register

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.usecase.RegisterUseCase
import com.shopperzmart.kotlin.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class RegisterState { object Idle: RegisterState(); object Loading: RegisterState(); data class Success(val phone: String): RegisterState(); data class Error(val msg: String): RegisterState() }

@HiltViewModel
class RegisterViewModel @Inject constructor(private val useCase: RegisterUseCase) : ViewModel() {
    val state = MutableStateFlow<RegisterState>(RegisterState.Idle)
    fun register(name: String, phone: String, pass: String) = viewModelScope.launch {
        state.value = RegisterState.Loading
        state.value = when (val r = useCase(name, phone, pass)) {
            is Result.Success -> RegisterState.Success(phone)
            is Result.Error   -> RegisterState.Error(r.message)
            else              -> RegisterState.Idle
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onRegistered: (String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: RegisterViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPass by remember { mutableStateOf(false) }

    LaunchedEffect(state) { if (state is RegisterState.Success) onRegistered((state as RegisterState.Success).phone) }

    Box(modifier = Modifier.fillMaxSize()) {
        Box(modifier = Modifier.fillMaxWidth().fillMaxHeight(0.38f).background(Brush.verticalGradient(listOf(Navy900, Navy800))))
        Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(40.dp))
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Color.White) }
            }
            Text("Create Account", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("Join Shopperz Mart today", fontSize = 14.sp, color = Navy400)
            Spacer(Modifier.height(24.dp))
            Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp), shape = RoundedCornerShape(24.dp), elevation = CardDefaults.cardElevation(12.dp)) {
                Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Sign Up", style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold))
                    OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name") }, leadingIcon = { Icon(Icons.Default.Person, null) }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500))
                    OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone Number") }, leadingIcon = { Icon(Icons.Default.Phone, null) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500))
                    OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, leadingIcon = { Icon(Icons.Default.Lock, null) }, trailingIcon = { IconButton(onClick = { showPass = !showPass }) { Icon(if (showPass) Icons.Default.VisibilityOff else Icons.Default.Visibility, null) } }, visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500))
                    if (state is RegisterState.Error) Text((state as RegisterState.Error).msg, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    Button(onClick = { viewModel.register(name, phone, password) }, enabled = state !is RegisterState.Loading, modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange500)) {
                        if (state is RegisterState.Loading) CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        else Text("Create Account", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                        Text("Already have an account?", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        TextButton(onClick = onNavigateBack) { Text("Sign In", color = Orange500, fontWeight = FontWeight.Bold) }
                    }
                }
            }
        }
    }
}
