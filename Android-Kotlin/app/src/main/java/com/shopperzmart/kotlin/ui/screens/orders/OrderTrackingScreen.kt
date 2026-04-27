package com.shopperzmart.kotlin.ui.screens.orders

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.shopperzmart.kotlin.domain.model.*
import com.shopperzmart.kotlin.ui.theme.*

// ═══════════════════════════════════════════════════════════════════════
// Order Tracking Screen — Daraz-inspired
// ═══════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderTrackingScreen(
    orderId: String,
    onNavigateBack: () -> Unit,
    viewModel: OrderDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(orderId) { viewModel.load(orderId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tracking Details", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        when (val s = state) {
            is OrderDetailState.Loading -> Box(
                Modifier.padding(padding).fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator(color = Orange500) }

            is OrderDetailState.Error -> Box(
                Modifier.padding(padding).fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Error, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Text(s.msg, color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = onNavigateBack) { Text("Go Back") }
                }
            }

            is OrderDetailState.Success -> TrackingContent(
                order = s.order,
                modifier = Modifier.padding(padding),
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Content
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun TrackingContent(order: OrderDetail, modifier: Modifier = Modifier) {
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current
    var copiedTrackingNumber by remember { mutableStateOf(false) }

    val activeStep = getActiveStep(order.orderStatus)

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // ── Courier Info Card ────────────────────────────────────────
        Card(
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(2.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // Courier icon circle
                Surface(
                    shape = CircleShape,
                    color = Color(0xFFE0F2FE),
                    modifier = Modifier.size(52.dp),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.LocalShipping, null, Modifier.size(24.dp), tint = Color(0xFF0284C7))
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "COURIER INFO",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 0.5.sp,
                    )
                    Text(
                        "Shopperz Logistics",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    )
                }

                // Tracking number section
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "TRACKING #",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 0.5.sp,
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            order.trackingNumber.ifBlank { "Pending" },
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0369A1),
                            ),
                        )
                        if (order.trackingNumber.isNotBlank()) {
                            IconButton(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(order.trackingNumber))
                                    copiedTrackingNumber = true
                                },
                                modifier = Modifier.size(28.dp),
                            ) {
                                Icon(
                                    if (copiedTrackingNumber) Icons.Default.Check else Icons.Default.ContentCopy,
                                    null, Modifier.size(14.dp),
                                    tint = Color(0xFF0284C7),
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── Horizontal Stepper ──────────────────────────────────────
        Card(
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(2.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(Modifier.padding(24.dp)) {
                HorizontalStepper(activeStep = activeStep)
            }
        }

        // ── Vertical Timeline ───────────────────────────────────────
        Card(
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(2.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(Modifier.padding(16.dp)) {
                Text(
                    "Tracking History",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.padding(bottom = 16.dp),
                )

                val reversedTimeline = order.timeline.reversed()
                reversedTimeline.forEachIndexed { idx, entry ->
                    TrackingTimelineItem(
                        entry = entry,
                        isLatest = idx == 0,
                        isLast = idx == reversedTimeline.lastIndex,
                    )
                }

                if (order.timeline.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.Timeline, null, Modifier.size(40.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "No tracking updates yet",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }

        // ── Track on Carrier Website ────────────────────────────────
        if (order.trackingUrl.isNotBlank()) {
            Button(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(order.trackingUrl))
                    context.startActivity(intent)
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
            ) {
                Icon(Icons.Default.Language, null, Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Track on Carrier Website", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(Modifier.height(16.dp))
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Horizontal Stepper
// ═══════════════════════════════════════════════════════════════════════

private data class StepperStage(
    val step: Int,
    val label: String,
    val icon: ImageVector,
)

private val STEPPER_STAGES = listOf(
    StepperStage(1, "Processing", Icons.Default.Inventory2),
    StepperStage(2, "Packed", Icons.Default.LocalMall),
    StepperStage(3, "Shipped", Icons.Default.LocalShipping),
    StepperStage(4, "Delivered", Icons.Default.DoneAll),
)

@Composable
private fun HorizontalStepper(activeStep: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        STEPPER_STAGES.forEach { stage ->
            val isActive = activeStep >= stage.step
            val isCurrent = activeStep == stage.step

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f),
            ) {
                // Circle with icon
                Surface(
                    shape = CircleShape,
                    color = if (isActive) Orange500 else MaterialTheme.colorScheme.surfaceVariant,
                    border = if (isCurrent) {
                        androidx.compose.foundation.BorderStroke(3.dp, Orange500.copy(alpha = 0.3f))
                    } else null,
                    modifier = Modifier.size(46.dp),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            stage.icon, null, Modifier.size(22.dp),
                            tint = if (isActive) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    stage.label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium,
                    ),
                    color = if (isActive) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Timeline Item
// ═══════════════════════════════════════════════════════════════════════

@Composable
private fun TrackingTimelineItem(
    entry: TimelineEntry,
    isLatest: Boolean,
    isLast: Boolean,
) {
    val dotColor = when {
        isLatest && entry.status == "delivered" -> Success
        isLatest && entry.status in listOf("cancelled", "delivery_failed") -> Error
        isLatest -> Orange500
        entry.status == "delivered" -> Success
        else -> MaterialTheme.colorScheme.outlineVariant
    }

    Row(modifier = Modifier.fillMaxWidth().animateContentSize()) {
        // Date + Time column
        Column(
            modifier = Modifier.width(80.dp).padding(top = 4.dp),
            horizontalAlignment = Alignment.End,
        ) {
            val dateStr = formatTrackingDate(entry.timestamp)
            val timeStr = formatTrackingTime(entry.timestamp)
            Text(
                dateStr,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = if (isLatest) FontWeight.Bold else FontWeight.Medium,
                ),
                color = if (isLatest) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline,
            )
            Text(
                timeStr,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.outline,
            )
        }

        Spacer(Modifier.width(12.dp))

        // Dot + connecting line
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(20.dp),
        ) {
            // Dot
            Box(
                modifier = Modifier
                    .size(if (isLatest) 16.dp else 10.dp)
                    .clip(CircleShape)
                    .background(dotColor)
                    .then(
                        if (isLatest) Modifier.border(3.dp, dotColor.copy(alpha = 0.3f), CircleShape)
                        else Modifier
                    ),
                contentAlignment = Alignment.Center,
            ) {
                if (isLatest) {
                    Icon(Icons.Default.Check, null, Modifier.size(8.dp), tint = Color.White)
                }
            }
            // Connecting line
            if (!isLast) {
                Box(
                    Modifier
                        .width(2.dp)
                        .height(40.dp)
                        .background(MaterialTheme.colorScheme.outlineVariant),
                )
            }
        }

        Spacer(Modifier.width(12.dp))

        // Content column
        Column(
            modifier = Modifier.weight(1f).padding(bottom = if (isLast) 0.dp else 24.dp, top = 2.dp),
        ) {
            Text(
                entry.status.replace("_", " ").replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = if (isLatest) FontWeight.Bold else FontWeight.Medium,
                ),
                color = if (isLatest) dotColor else MaterialTheme.colorScheme.onSurface,
            )
            if (entry.note.isNotBlank()) {
                Text(
                    entry.note,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

private fun getActiveStep(status: String): Int = when (status.lowercase()) {
    "placed", "confirmed", "preparing" -> 1
    "packed" -> 2
    "in_transit", "delivery_assigned", "out_for_delivery",
    "delivery_attempt_1", "delivery_attempt_2", "delivery_attempt_3" -> 3
    "delivered", "delivery_failed", "cancelled" -> 4
    else -> 1
}

private fun formatTrackingDate(isoDate: String): String {
    return try {
        val date = isoDate.substringBefore("T").substringBefore(" ")
        val parts = date.split("-")
        if (parts.size == 3) {
            val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
            val month = months.getOrElse(parts[1].toInt() - 1) { "?" }
            "$month ${parts[2].toInt()}"
        } else isoDate
    } catch (_: Exception) { isoDate }
}

private fun formatTrackingTime(isoDate: String): String {
    return try {
        isoDate.substringAfter("T").take(5)
    } catch (_: Exception) { "" }
}
