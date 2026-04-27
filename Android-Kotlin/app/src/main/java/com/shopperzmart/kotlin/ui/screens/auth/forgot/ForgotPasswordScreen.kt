package com.shopperzmart.kotlin.ui.screens.auth.forgot

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shopperzmart.kotlin.ui.theme.Orange500

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit,
    onPasswordReset: () -> Unit,
) {
    var phone by remember { mutableStateOf("") }
    Scaffold(
        topBar = { TopAppBar(title = { Text("Forgot Password") }, navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }) }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically)) {
            Icon(Icons.Default.Lock, null, Modifier.size(72.dp), tint = Orange500)
            Text("Reset Password", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold))
            Text("Enter your phone number to receive an OTP.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone Number") }, leadingIcon = { Icon(Icons.Default.Phone, null) }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500))
            Button(onClick = onPasswordReset, modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange500)) {
                Text("Send OTP", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
