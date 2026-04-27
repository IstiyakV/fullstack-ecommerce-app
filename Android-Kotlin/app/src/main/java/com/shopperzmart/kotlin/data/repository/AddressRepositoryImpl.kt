package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.Address
import com.shopperzmart.kotlin.domain.repository.AddressRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

class AddressRepositoryImpl @Inject constructor(
    private val api: ApiService,
) : AddressRepository {

    override suspend fun getAddresses(userKey: String): Result<List<Address>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getAddress(mapOf("user_key" to userKey))
                if (res.statusCode == 200 && res.data != null) {
                    val addresses = res.data.map { dto ->
                        Address(
                            addressId     = dto.addressId?.toString() ?: "",
                            customerId    = dto.customerId ?: "",
                            recipientName = dto.recipientName ?: "",
                            phone         = dto.phone ?: "",
                            fullAddress   = dto.fullAddress ?: "",
                            cityId        = dto.cityId ?: "",
                            cityName      = dto.cityName ?: "",
                            postalCode    = dto.postalCode ?: "",
                            label         = dto.label ?: "home",
                            isDefault     = dto.isDefault == "1"
                        )
                    }
                    Result.Success(addresses)
                } else {
                    Result.Error(res.message ?: "Failed to load addresses")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }

    override suspend fun saveAddress(body: Map<String, String>): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.saveAddress(body)
                if (res.statusCode == 200) Result.Success(res.message ?: "Address saved")
                else Result.Error(res.message ?: "Failed to save address")
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }

    override suspend fun deleteAddress(addressId: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.deleteAddress(mapOf("address_id" to addressId))
                if (res.statusCode == 200) Result.Success(res.message ?: "Address deleted")
                else Result.Error(res.message ?: "Failed to delete address")
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
}
