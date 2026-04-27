package com.shopperzmart.kotlin.data.repository

import com.shopperzmart.kotlin.core.network.ApiService
import com.shopperzmart.kotlin.core.utils.Result
import com.shopperzmart.kotlin.domain.model.Order
import com.shopperzmart.kotlin.domain.model.OrderDetail
import com.shopperzmart.kotlin.domain.repository.OrderRepository
import com.shopperzmart.kotlin.data.remote.mapper.toDomain
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

class OrderRepositoryImpl @Inject constructor(
    private val api: ApiService
) : OrderRepository {

    override suspend fun placeOrder(payload: Map<String, Any>): Result<Boolean> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.placeOrder(payload)
                if (res.statusCode == 200) Result.Success(true)
                else Result.Error(res.message ?: "Failed to place order")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun getOrders(userKey: String): Result<List<Order>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getOrders(mapOf("user_key" to userKey))
                if (res.statusCode == 200) {
                    val ordersList = res.data?.map { item ->
                        Order(
                            orderId = item.orderId?.toString() ?: "",
                            totalAmount = item.totalAmount?.toDoubleOrNull() ?: 0.0,
                            orderStatus = item.orderStatus ?: "pending",
                            date = item.createdAt ?: "",
                        )
                    } ?: emptyList()
                    Result.Success(ordersList)
                } else Result.Error(res.message ?: "Failed to load orders")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun getOrderDetails(orderId: String): Result<OrderDetail> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getOrderDetails(mapOf("order_id" to orderId))
                if (res.statusCode == 200 && res.data != null) {
                    Result.Success(res.data.toDomain())
                } else Result.Error(res.message ?: "Order not found")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }

    override suspend fun cancelOrder(orderId: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.cancelOrder(mapOf("order_id" to orderId))
                if (res.statusCode == 200) Result.Success(res.message ?: "Order cancelled")
                else Result.Error(res.message ?: "Failed to cancel order")
            } catch (e: Exception) { Result.Error(e.message ?: "Network error") }
        }
}

