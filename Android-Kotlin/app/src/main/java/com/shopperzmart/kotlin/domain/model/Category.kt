package com.shopperzmart.kotlin.domain.model

data class Category(
    val parentCategoryId: String,
    val parentCategoryNameEn: String,
    val parentCategoryNameBn: String,
    val featuredImage: String,
    val isActive: String,
)

data class Slider(
    val sliderId: String,
    val sliderImage: String,
    val sliderTitle: String,
    val sliderUrl: String,
)

data class BannerSlider(
    val promotionalSliderId: String,
    val sectionId: String,
    val sliderImage: String,
    val sliderMobileImage: String,
    val sliderTitle: String,
    val sliderUrl: String,
)

data class Brand(
    val brandId: String,
    val brandImage: String,
    val categoryNameEn: String,
)

data class WholeSaleCategory(
    val wholeSaleCategoryId: String,
    val categoryNameEn: String,
    val categoryNameBn: String,
    val categoryImage: String,
)
