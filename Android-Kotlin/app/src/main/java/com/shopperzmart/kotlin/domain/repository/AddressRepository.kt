package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.Address

interface AddressRepository {
    suspend fun getAddresses(userKey: String): Result<List<Address>>
    suspend fun saveAddress(body: Map<String, String>): Result<String>
    suspend fun deleteAddress(addressId: String): Result<String>
}
