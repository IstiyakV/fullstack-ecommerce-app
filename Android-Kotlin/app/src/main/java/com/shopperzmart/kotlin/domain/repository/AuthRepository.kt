package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.Customer

interface AuthRepository {
    suspend fun login(phone: String, password: String): Result<Customer>
    suspend fun googleLogin(idToken: String): Result<Customer>
    suspend fun register(name: String, phone: String, password: String): Result<String>
    suspend fun verifyOtp(phone: String, otp: String): Result<String>
    suspend fun updateProfile(name: String, email: String, phone: String): Result<Customer>
    suspend fun logout()
}
