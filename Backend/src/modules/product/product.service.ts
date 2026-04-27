import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { Address } from '../../database/entities/address.entity';
import { Voucher } from '../../database/entities/voucher.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Review } from '../../database/entities/review.entity';
import { ProductImage } from '../../database/entities/product-image.entity';
import { VariantType } from '../../database/entities/variant-type.entity';
import { VariantOption } from '../../database/entities/variant-option.entity';
import { ProductSku } from '../../database/entities/product-sku.entity';

const BASE_OK = { status_code: 200, custom_status_code: 200, message: 'Success', access_token: '' };

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Voucher) private voucherRepo: Repository<Voucher>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(VariantType) private variantTypeRepo: Repository<VariantType>,
    @InjectRepository(VariantOption) private variantOptionRepo: Repository<VariantOption>,
    @InjectRepository(ProductSku) private skuRepo: Repository<ProductSku>,
  ) {}

  async getProductDetails(productId: string) {
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) return { status_code: 404, custom_status_code: 404, message: 'Product not found.' };

    // Fetch related products
    const related = await this.productRepo.find({ where: { category_id: product.category_id }, take: 8 });

    // Fetch product images
    const images = await this.imageRepo.find({
      where: { product_id: productId },
      order: { sort_order: 'ASC' },
    });

    // If no images stored, create a default from featured_image
    const imageList = images.length > 0
      ? images.map(img => ({ image_id: img.image_id.toString(), image_url: img.image_url, sort_order: img.sort_order, is_primary: img.is_primary }))
      : [{ image_id: '0', image_url: product.featured_image, sort_order: '0', is_primary: '1' }];

    // Fetch variant types with their options
    const variantTypes = await this.variantTypeRepo.find({
      where: { product_id: productId },
      order: { sort_order: 'ASC' },
    });

    const variantTypesWithOptions: any[] = [];
    for (const vt of variantTypes) {
      const options = await this.variantOptionRepo.find({
        where: { type_id: vt.type_id.toString(), is_active: '1' },
        order: { sort_order: 'ASC' },
      });
      variantTypesWithOptions.push({
        type_id: vt.type_id.toString(),
        type_name: vt.type_name,
        sort_order: vt.sort_order,
        options: options.map(o => {
          let gallery = [];
          try { if (o.gallery_images) gallery = JSON.parse(o.gallery_images); } catch {}
          const thumb = o.option_image || (gallery.length > 0 ? gallery[0] : null);
          return {
            option_id: o.option_id.toString(),
            option_value: o.option_value,
            option_image: thumb,
            color_code: o.color_code,
            sort_order: o.sort_order,
            is_default: o.is_default || '0',
            gallery_images: gallery,
          };
        }),
      });
    }

    // Fetch SKU combinations
    const skus = await this.skuRepo.find({
      where: { product_id: productId },
      order: { sku_code: 'ASC' },
    });

    // Fetch reviews
    const reviews = await this.reviewRepo.find({
      where: { product_id: productId },
      order: { created_at: 'DESC' },
    });

    // Compute review summary
    const starDist = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    let totalRating = 0;
    for (const r of reviews) {
      const s = Math.min(5, Math.max(1, r.rating));
      starDist[s.toString()] = (starDist[s.toString()] || 0) + 1;
      totalRating += s;
    }
    const avgRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0;

    return {
      ...BASE_OK,
      data: product,
      images: imageList,
      variant_types: variantTypesWithOptions,
      skus: skus.map(s => ({
        sku_id: s.sku_id.toString(),
        sku_code: s.sku_code,
        regular_price: s.regular_price,
        price: s.price,
        stock: s.stock,
        is_active: s.is_active,
        combination: s.combination,
      })),
      related_products: related.filter(p => p.product_id !== product.product_id),
      reviews: reviews.map(r => ({
        review_id: r.review_id.toString(),
        product_id: r.product_id,
        customer_id: r.customer_id,
        customer_name: r.customer_name,
        rating: r.rating.toString(),
        title: r.title,
        comment: r.comment,
        verified_purchase: r.verified_purchase,
        helpful_count: r.helpful_count,
        created_at: r.created_at.toISOString(),
      })),
      review_summary: {
        average_rating: avgRating,
        total_reviews: reviews.length,
        star_distribution: starDist,
      },
      user_review: null,
      is_bought: 0,
    };
  }

  async filterProducts(body: any) {
    const qb = this.productRepo.createQueryBuilder('p')
      .where('p.is_whole_sales = :ws', { ws: '0' });

    // Search query — match product name or details
    if (body.search_query && body.search_query.toString().trim()) {
      const q = `%${body.search_query.toString().trim().toLowerCase()}%`;
      qb.andWhere('(LOWER(p.product_name) LIKE :q OR LOWER(p.product_details) LIKE :q)', { q });
    }

    // Category filter
    if (body.product_category_id) {
      qb.andWhere('p.category_id = :catId', { catId: body.product_category_id.toString() });
    }

    // Price range filter
    if (body.price_min) {
      qb.andWhere('CAST(p.selling_price AS REAL) >= :pmin', { pmin: parseFloat(body.price_min) });
    }
    if (body.price_max) {
      qb.andWhere('CAST(p.selling_price AS REAL) <= :pmax', { pmax: parseFloat(body.price_max) });
    }

    // Boolean filters
    if (body.is_gadgets) qb.andWhere('p.category_id = :gadgetId', { gadgetId: '1' });

    if (body.is_new_arrivals) qb.orderBy('p.product_id', 'DESC');
    else if (body.is_hot_deals) qb.orderBy('p.discount_rate', 'DESC');
    else if (body.is_popular) qb.orderBy('p.product_rating', 'DESC');

    // Sort
    const sortBy = body.sort_by || '';
    if (sortBy === 'price_asc') qb.orderBy('CAST(p.selling_price AS REAL)', 'ASC');
    else if (sortBy === 'price_desc') qb.orderBy('CAST(p.selling_price AS REAL)', 'DESC');
    else if (sortBy === 'newest') qb.orderBy('p.product_id', 'DESC');
    else if (sortBy === 'rating') qb.orderBy('p.product_rating', 'DESC');
    else if (!body.is_new_arrivals && !body.is_hot_deals && !body.is_popular) {
      qb.orderBy('p.product_id', 'DESC');
    }

    // Get total before pagination
    const totalCount = await qb.getCount();

    // Pagination
    const page = parseInt(body.page) || 1;
    const perPage = parseInt(body.per_page) || 20;
    qb.skip((page - 1) * perPage).take(perPage);

    const products = await qb.getMany();
    return { ...BASE_OK, data: products, total_count: totalCount, page, per_page: perPage };
  }

  async filterWsProducts(body: any) {
    const products = await this.productRepo.find({ where: { is_whole_sales: '1' }, take: 20 });
    return { ...BASE_OK, data: products };
  }

  async getWsProductDetails(body: any) {
    const productId = body.ws_product_id || body.product_id;
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) return { status_code: 404, custom_status_code: 404, message: 'Product not found.' };
    return {
      ...BASE_OK,
      data: product,
      images: [{ image_id: '1', product_id: product.product_id.toString(), image: product.featured_image }],
      related_products: [],
      reviews: [],
    };
  }

  async saveAddress(body: any) {
    if (body.is_default === '1') {
      await this.addressRepo.update(
        { customer_id: body.user_key || body.customer_id },
        { is_default: '0' }
      );
    }
    const addr = this.addressRepo.create({ ...body });
    await this.addressRepo.save(addr);
    return { ...BASE_OK, message: 'Address saved successfully.' };
  }

  async getAddress(body: any) {
    const addresses = await this.addressRepo.find({ where: { customer_id: body.user_key } });
    return { ...BASE_OK, data: addresses };
  }

  async deleteAddress(body: any) {
    await this.addressRepo.delete({ address_id: body.address_id });
    return { ...BASE_OK, message: 'Address deleted.' };
  }

  async getVouchers(body: any) {
    const vouchers = await this.voucherRepo.find({ where: { is_active: '1' } });
    return { ...BASE_OK, data: vouchers };
  }

  async applyPromo(body: any) {
    const voucher = await this.voucherRepo.findOne({ where: { voucher_code: body.coupon_code, is_active: '1' } });
    if (!voucher) return { status_code: 400, custom_status_code: 400, message: 'Invalid or expired coupon code.' };
    return { ...BASE_OK, message: 'Coupon applied!', data: voucher };
  }

  async writeReview(body: any) {
    const review = this.reviewRepo.create({
      product_id: body.product_id?.toString() || '',
      customer_id: body.user_key?.toString() || body.customer_id?.toString() || '',
      customer_name: body.customer_name || 'Anonymous',
      rating: parseInt(body.rating) || 5,
      title: body.title || '',
      comment: body.comment || '',
      verified_purchase: body.verified_purchase || '0',
    });
    await this.reviewRepo.save(review);
    return { ...BASE_OK, message: 'Review submitted successfully.' };
  }

  async sendFeedback(body: any) {
    return { ...BASE_OK, message: 'Feedback sent. Thank you!' };
  }

  async followStore(body: any) {
    return { ...BASE_OK, message: 'Store followed successfully.' };
  }

  async getNotifications(body: any) {
    const notifs = await this.notifRepo.find({ where: { customer_id: body.user_key } });
    return { ...BASE_OK, data: notifs };
  }
}
