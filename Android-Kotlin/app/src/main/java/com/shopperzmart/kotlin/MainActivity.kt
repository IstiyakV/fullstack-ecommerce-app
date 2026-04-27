package com.shopperzmart.kotlin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.shopperzmart.kotlin.core.network.ConnectivityObserver
import com.shopperzmart.kotlin.ui.navigation.AppNavigation
import com.shopperzmart.kotlin.ui.theme.ShopperzMartTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var connectivityObserver: ConnectivityObserver

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ShopperzMartTheme {
                AppNavigation(connectivityObserver)
            }
        }
    }
}
