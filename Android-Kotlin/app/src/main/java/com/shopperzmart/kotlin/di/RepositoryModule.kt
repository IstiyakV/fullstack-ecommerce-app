package com.shopperzmart.kotlin.di

import com.shopperzmart.kotlin.data.repository.*
import com.shopperzmart.kotlin.domain.repository.*
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds @Singleton abstract fun bindHomeRepo(impl: HomeRepositoryImpl): HomeRepository
    @Binds @Singleton abstract fun bindAuthRepo(impl: AuthRepositoryImpl): AuthRepository
    @Binds @Singleton abstract fun bindProductRepo(impl: ProductRepositoryImpl): ProductRepository
    @Binds @Singleton abstract fun bindCartRepo(impl: CartRepositoryImpl): CartRepository
    @Binds @Singleton abstract fun bindWishlistRepo(impl: WishlistRepositoryImpl): WishlistRepository
    @Binds @Singleton abstract fun bindOrderRepo(impl: OrderRepositoryImpl): OrderRepository
    @Binds @Singleton abstract fun bindAddressRepo(impl: AddressRepositoryImpl): AddressRepository
    @Binds @Singleton abstract fun bindConfigRepo(impl: ConfigRepositoryImpl): ConfigRepository
}
