package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.local.datastore.UserPreferences
import com.shopperzmart.kotlin.data.remote.mapper.toDomain
import com.shopperzmart.kotlin.domain.model.Customer
import com.shopperzmart.kotlin.domain.repository.AuthRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: ApiService,
    private val prefs: UserPreferences,
) : AuthRepository {

    override suspend fun login(phone: String, password: String): Result<Customer> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.login(mapOf("customer_phone" to phone, "password" to password))
                if (res.statusCode == 200 && res.data != null) {
                    val customer = res.data.toDomain(res.accessToken ?: "")
                    prefs.saveUser(
                        token = res.accessToken ?: "",
                        id    = customer.customerId,
                        name  = customer.customerName,
                        phone = customer.customerPhone,
                        email = customer.customerEmail,
                    )
                    Result.Success(customer)
                } else {
                    Result.Error(res.message ?: "Login failed", res.statusCode)
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }

    override suspend fun googleLogin(idToken: String): Result<Customer> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.googleLogin(mapOf("id_token" to idToken))
                if (res.statusCode == 200 && res.data != null) {
                    val customer = res.data.toDomain(res.accessToken ?: "")
                    prefs.saveUser(
                        token = res.accessToken ?: "",
                        id    = customer.customerId,
                        name  = customer.customerName,
                        phone = customer.customerPhone,
                        email = customer.customerEmail,
                    )
                    Result.Success(customer)
                } else {
                    Result.Error(res.message ?: "Google login failed", res.statusCode)
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }

    override suspend fun register(name: String, phone: String, password: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.register(mapOf(
                    "customer_name" to name,
                    "customer_phone" to phone,
                    "password" to password,
                ))
                if (res.statusCode == 200) {
                    Result.Success(res.message ?: "Registration successful")
                } else {
                    Result.Error(res.message ?: "Registration failed")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }

    override suspend fun verifyOtp(phone: String, otp: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.checkOtp(mapOf("customer_phone" to phone, "otp" to otp))
                if (res.statusCode == 200) Result.Success(res.message ?: "OTP verified")
                else Result.Error(res.message ?: "OTP failed")
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }

    override suspend fun updateProfile(name: String, email: String, phone: String): Result<Customer> =
        withContext(Dispatchers.IO) {
            try {
                val tkn = prefs.accessToken.first()
                val res = api.updateProfile(mapOf(
                    "access_token" to tkn,
                    "customer_name" to name,
                    "customer_email" to email,
                    "customer_phone" to phone,
                ))
                if (res.statusCode == 200 && res.data != null) {
                    val customer = res.data.toDomain(res.accessToken ?: "")
                    prefs.updateUser(name = customer.customerName, phone = customer.customerPhone, email = customer.customerEmail)
                    Result.Success(customer)
                } else Result.Error(res.message ?: "Update failed")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun logout() {
        prefs.clearUser()
    }
}
