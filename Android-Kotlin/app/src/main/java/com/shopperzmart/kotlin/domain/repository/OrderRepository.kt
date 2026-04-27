package com.shopperzmart.kotlin.domain.repository

import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.OrderDetail

interface OrderRepository {
    suspend fun placeOrder(payload: Map<String, Any>): Result<Boolean>
    suspend fun getOrders(userKey: String): Result<List<com.shopperzmart.kotlin.domain.model.Order>>
    suspend fun getOrderDetails(orderId: String): Result<OrderDetail>
    suspend fun cancelOrder(orderId: String): Result<String>
}
