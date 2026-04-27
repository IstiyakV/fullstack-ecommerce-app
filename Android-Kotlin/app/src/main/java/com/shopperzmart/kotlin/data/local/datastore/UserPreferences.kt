package com.shopperzmart.kotlin.data.local.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore("shopperz_prefs")

@Singleton
class UserPreferences @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        val KEY_ACCESS_TOKEN = stringPreferencesKey("access_token")
        val KEY_USER_ID      = stringPreferencesKey("user_id")
        val KEY_USER_NAME    = stringPreferencesKey("user_name")
        val KEY_USER_PHONE   = stringPreferencesKey("user_phone")
        val KEY_USER_EMAIL   = stringPreferencesKey("user_email")
        val KEY_IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
    }

    val isLoggedIn: Flow<Boolean> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { it[KEY_IS_LOGGED_IN] ?: false }

    val accessToken: Flow<String> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { it[KEY_ACCESS_TOKEN] ?: "" }

    val userName: Flow<String> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { it[KEY_USER_NAME] ?: "" }

    val userPhone: Flow<String> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { it[KEY_USER_PHONE] ?: "" }

    val userKey: Flow<String> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { it[KEY_USER_ID] ?: "" }

    val userEmail: Flow<String> = context.dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { it[KEY_USER_EMAIL] ?: "" }

    suspend fun saveUser(token: String, id: String, name: String, phone: String, email: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = token
            prefs[KEY_USER_ID]      = id
            prefs[KEY_USER_NAME]    = name
            prefs[KEY_USER_PHONE]   = phone
            prefs[KEY_USER_EMAIL]   = email
            prefs[KEY_IS_LOGGED_IN] = true
        }
    }

    suspend fun updateUser(name: String, phone: String, email: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_NAME]  = name
            prefs[KEY_USER_PHONE] = phone
            prefs[KEY_USER_EMAIL] = email
        }
    }

    suspend fun clearUser() {
        context.dataStore.edit { it.clear() }
    }
}
