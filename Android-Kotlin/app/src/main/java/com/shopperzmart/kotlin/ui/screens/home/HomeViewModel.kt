package com.shopperzmart.kotlin.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.HomeFeed
import com.shopperzmart.kotlin.domain.usecase.GetHomeFeedUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class HomeUiState {
    object Loading : HomeUiState()
    data class Success(val feed: HomeFeed) : HomeUiState()
    data class Error(val message: String) : HomeUiState()
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getHomeFeed: GetHomeFeedUseCase,
    private val recentlyViewedDao: com.shopperzmart.kotlin.data.local.dao.RecentlyViewedDao,
) : ViewModel() {

    private val _state = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val state: StateFlow<HomeUiState> = _state

    val recentlyViewed = recentlyViewedDao.getRecentlyViewed()

    init { loadHome() }

    fun loadHome() {
        viewModelScope.launch {
            _state.value = HomeUiState.Loading
            when (val result = getHomeFeed()) {
                is Result.Success -> _state.value = HomeUiState.Success(result.data)
                is Result.Error   -> _state.value = HomeUiState.Error(result.message)
                else -> {}
            }
        }
    }
}
