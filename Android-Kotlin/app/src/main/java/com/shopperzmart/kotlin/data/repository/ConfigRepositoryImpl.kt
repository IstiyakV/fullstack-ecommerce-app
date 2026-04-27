package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.remote.dto.*
import com.shopperzmart.kotlin.domain.repository.ConfigRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

class ConfigRepositoryImpl @Inject constructor(
    private val api: ApiService,
) : ConfigRepository {

    override suspend fun getCities(): Result<List<CityDto>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getCities(emptyMap())
                if (res.statusCode == 200 && res.data != null) Result.Success(res.data)
                else Result.Error("Failed to load cities")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun getShippingZones(): Result<List<ShippingZoneDto>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getShippingZones(emptyMap())
                if (res.statusCode == 200 && res.data != null) Result.Success(res.data)
                else Result.Error("Failed to load shipping zones")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun getShippingZoneForCity(cityId: String): Result<ShippingZoneDataDto> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getShippingZoneForCity(mapOf("city_id" to cityId))
                if (res.statusCode == 200 && res.data != null) Result.Success(res.data)
                else Result.Error("Failed to load shipping info")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun getAppConfig(): Result<Map<String, String>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getAppConfig(emptyMap())
                if (res.statusCode == 200 && res.data != null) Result.Success(res.data)
                else Result.Error("Failed to load config")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun getPaymentGateways(): Result<List<PaymentGatewayDto>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getPaymentGateways(emptyMap())
                if (res.statusCode == 200 && res.data != null) Result.Success(res.data)
                else Result.Error("Failed to load gateways")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }
}
