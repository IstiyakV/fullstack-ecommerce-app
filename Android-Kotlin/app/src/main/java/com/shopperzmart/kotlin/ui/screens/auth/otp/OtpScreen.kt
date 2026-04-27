package com.shopperzmart.kotlin.ui.screens.auth.otp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shopperzmart.kotlin.ui.theme.Orange500

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OtpScreen(
    phone: String,
    onVerified: () -> Unit,
    onNavigateBack: () -> Unit,
) {
    var otp by remember { mutableStateOf("") }
    Scaffold(
        topBar = { TopAppBar(title = { Text("Verify OTP") }, navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }) }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(20.dp, Alignment.CenterVertically)) {
            Text("OTP Verification", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold))
            Text("Enter the OTP sent to $phone", textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.onSurfaceVariant)
            OutlinedTextField(
                value = otp, onValueChange = { if (it.length <= 6) otp = it },
                label = { Text("Enter OTP") }, modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Orange500, focusedLabelColor = Orange500),
            )
            Button(onClick = onVerified, modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange500)) {
                Text("Verify", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
