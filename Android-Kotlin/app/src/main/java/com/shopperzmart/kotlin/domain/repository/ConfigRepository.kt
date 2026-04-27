package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.data.remote.dto.*

interface ConfigRepository {
    suspend fun getCities(): Result<List<CityDto>>
    suspend fun getShippingZones(): Result<List<ShippingZoneDto>>
    suspend fun getShippingZoneForCity(cityId: String): Result<ShippingZoneDataDto>
    suspend fun getAppConfig(): Result<Map<String, String>>
    suspend fun getPaymentGateways(): Result<List<PaymentGatewayDto>>
}
