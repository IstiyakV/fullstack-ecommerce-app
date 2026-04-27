package com.shopperzmart.kotlin.ui.screens.notifications

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.remote.mapper.toDomain
import com.shopperzmart.kotlin.domain.model.Notification
import com.shopperzmart.kotlin.ui.theme.Orange500
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    val notifications = MutableStateFlow<List<Notification>>(emptyList())
    val loading = MutableStateFlow(true)
    init { load() }
    private fun load() = viewModelScope.launch {
        try {
            val res = api.getNotifications(emptyMap())
            notifications.value = res.data?.map { it.toDomain() } ?: emptyList()
        } catch (e: Exception) { /* ignore */ }
        loading.value = false
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNavigateBack: () -> Unit,
    viewModel: NotificationsViewModel = hiltViewModel(),
) {
    val items by viewModel.notifications.collectAsState()
    val loading by viewModel.loading.collectAsState()
    Scaffold(
        topBar = { TopAppBar(title = { Text("Notifications", fontWeight = FontWeight.Bold) }, navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }) }
    ) { padding ->
        if (loading) Box(modifier = Modifier.padding(padding).fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) { CircularProgressIndicator(color = Orange500) }
        else LazyColumn(modifier = Modifier.padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(items) { n ->
                Card(shape = RoundedCornerShape(12.dp)) {
                    ListItem(
                        headlineContent = { Text(n.title, fontWeight = FontWeight.SemiBold) },
                        supportingContent = { Text(n.message, color = MaterialTheme.colorScheme.onSurfaceVariant) },
                        leadingContent = { Icon(Icons.Default.NotificationsActive, null, tint = Orange500) },
                        trailingContent = { Text(n.createdAt.take(10), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant) },
                    )
                }
            }
        }
    }
}
