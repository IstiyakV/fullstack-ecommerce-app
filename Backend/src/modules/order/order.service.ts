import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { PaymentGateway } from '../../database/entities/payment-gateway.entity';
import { OrderTimeline } from '../../database/entities/order-timeline.entity';
import { Address } from '../../database/entities/address.entity';
import * as fs from 'fs';
import * as path from 'path';

const BASE_OK = { status_code: 200, custom_status_code: 200, message: 'Success', access_token: '' };

const NON_CANCELLABLE = [
  'packed', 'in_transit', 'delivery_assigned', 'out_for_delivery',
  'delivery_attempt_1', 'delivery_attempt_2', 'delivery_attempt_3',
  'delivered', 'delivery_failed', 'cancelled',
];

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(PaymentGateway) private gatewayRepo: Repository<PaymentGateway>,
    @InjectRepository(OrderTimeline) private timelineRepo: Repository<OrderTimeline>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
  ) {}

  async placeOrder(body: any) {
    const customerId = body.user_key || body.customer_id;
    
    if (!customerId) {
      return { status_code: 400, custom_status_code: 400, message: 'Customer authentication failed. Please login and try again.' };
    }

    if (!body.items || body.items.length === 0) {
      return { status_code: 400, custom_status_code: 400, message: 'Your cart is empty. Please add items to place an order.' };
    }

    const items = body.items;

    // Normalize the shipping address to always store a proper object
    let shippingAddr = body.shipping_address || {};
    if (typeof shippingAddr === 'string') {
      // Legacy: was sent as a flat string — wrap it
      shippingAddr = { full_address: shippingAddr };
    }

    const order = this.orderRepo.create({
      customer_id: customerId,
      product_details: JSON.stringify(items),
      total_amount: body.total_amount || '0',
      shipping_fee: body.shipping_fee || body.shipping_charge || '0',
      discount_amount: body.discount_amount || '0',
      coupon_code: body.coupon_code || '',
      address_id: body.address_id || '',
      shipping_address: JSON.stringify(shippingAddr),
      shipping_method: body.shipping_method || 'standard',
      payment_method: body.payment_method || 'cod',
      payment_status: body.payment_method === 'cod' ? 'pending' : (body.payment_status || 'pending'),
      stripe_payment_intent_id: body.stripe_payment_intent_id || '',
      order_status: 'placed', // Admin must confirm
      estimated_delivery: body.estimated_delivery || '',
    });
    const saved = await this.orderRepo.save(order);

    // ── Copy product images to /order-assets/<order_id>/ ─────────────
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const orderAssetsDir = path.join(uploadsRoot, 'order-assets', saved.order_id.toString());
    try { fs.mkdirSync(orderAssetsDir, { recursive: true }); } catch (_) {}

    const updatedItems = items.map((item: any, idx: number) => {
      const imgUrl = item.image || item.featured_image || '';
      if (!imgUrl) return item;

      try {
        // Image URL format: /uploads/filename.jpg or http://host/uploads/filename.jpg
        const filename = imgUrl.split('/').pop();
        if (!filename) return item;

        const srcPath = path.join(uploadsRoot, filename);
        const destFilename = `item_${idx}_${filename}`;
        const destPath = path.join(orderAssetsDir, destFilename);

        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          return { ...item, image: `/uploads/order-assets/${saved.order_id}/${destFilename}` };
        }
      } catch (_) {}
      return item; // Keep original URL if copy fails
    });

    // Update product_details with new image paths
    saved.product_details = JSON.stringify(updatedItems);
    await this.orderRepo.save(saved);

    // Create initial timeline entry (only "placed" — admin confirms later)
    const timelineEntry = this.timelineRepo.create({
      order_id: saved.order_id.toString(),
      status: 'placed',
      note: 'Order has been placed successfully.',
    });
    await this.timelineRepo.save(timelineEntry);

    return {
      ...BASE_OK,
      message: 'Order placed successfully!',
      data: {
        order_id: saved.order_id.toString(),
        order_status: saved.order_status,
      },
    };
  }

  async getOrderHistory(body: any) {
    const orders = await this.orderRepo.find({
      where: { customer_id: body.user_key },
      order: { created_at: 'DESC' },
    });
    return { ...BASE_OK, data: orders };
  }

  /**
   * Resolves the shipping address for an order.
   * Priority: parsed JSON object from order → fallback lookup by address_id → empty.
   */
  private async resolveAddress(order: Order): Promise<any> {
    // 1. Try parsing the stored shipping_address JSON
    let address: any = {};
    try { address = JSON.parse(order.shipping_address || '{}'); } catch (_) {}

    // 2. If it parsed to a string (legacy format), wrap it
    if (typeof address === 'string') {
      address = { full_address: address };
    }

    // 3. If the parsed object has a recipient_name, it's a proper address — return it
    if (address.recipient_name || address.recipientName) {
      return {
        recipient_name: address.recipient_name || address.recipientName || '',
        phone: address.phone || '',
        full_address: address.full_address || address.fullAddress || '',
        city_name: address.city_name || address.cityName || '',
        postal_code: address.postal_code || address.postalCode || '',
        label: address.label || '',
      };
    }

    // 4. Fallback: look up the address by address_id from the Address table
    if (order.address_id) {
      try {
        const dbAddr = await this.addressRepo.findOne({ where: { address_id: order.address_id } });
        if (dbAddr) {
          return {
            recipient_name: dbAddr.recipient_name || '',
            phone: dbAddr.phone || '',
            full_address: dbAddr.full_address || '',
            city_name: dbAddr.city_name || '',
            postal_code: dbAddr.postal_code || '',
            label: dbAddr.label || '',
          };
        }
      } catch (_) {}
    }

    // 5. Last resort: return whatever we have (may include full_address from legacy string)
    return {
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      full_address: address.full_address || '',
      city_name: address.city_name || '',
      postal_code: address.postal_code || '',
      label: address.label || '',
    };
  }

  async getOrderDetails(body: any) {
    const order = await this.orderRepo.findOne({ where: { order_id: body.order_id } });
    if (!order) return { status_code: 404, message: 'Order not found.' };

    let items: any[] = [];
    try { items = JSON.parse(order.product_details || '[]'); } catch (_) {}

    const resolvedAddress = await this.resolveAddress(order);

    const timeline = await this.timelineRepo.find({
      where: { order_id: order.order_id.toString() },
      order: { timestamp: 'ASC' },
    });

    const canCancel = !NON_CANCELLABLE.includes(order.order_status);

    return {
      ...BASE_OK,
      data: {
        order_id: order.order_id.toString(),
        customer_id: order.customer_id,
        total_amount: order.total_amount || '0',
        shipping_fee: order.shipping_fee || '0',
        discount_amount: order.discount_amount || '0',
        coupon_code: order.coupon_code || '',
        shipping_method: order.shipping_method || 'standard',
        payment_method: order.payment_method || 'cod',
        payment_status: order.payment_status || 'pending',
        order_status: order.order_status || 'placed',
        estimated_delivery: order.estimated_delivery || '',
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
        created_at: order.created_at,
        can_cancel: canCancel,
        items: items.map((item: any) => ({
          product_id: item.productId || item.product_id || '',
          product_name: item.productName || item.product_name || '',
          image: item.image || item.featured_image || '',
          selling_price: item.sellingPrice?.toString() || item.selling_price || '0',
          quantity: item.quantity?.toString() || item.qty || '1',
          shop_name: item.shopName || item.shop_name || '',
        })),
        shipping_address: resolvedAddress,
        timeline: timeline.map(t => ({
          timeline_id: t.timeline_id.toString(),
          status: t.status,
          note: t.note,
          timestamp: t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp,
        })),
      },
    };
  }

  async cancelOrder(body: any) {
    const order = await this.orderRepo.findOne({ where: { order_id: body.order_id } });
    if (!order) return { status_code: 404, message: 'Order not found.' };

    if (NON_CANCELLABLE.includes(order.order_status)) {
      return { status_code: 400, message: 'Cannot cancel order at this stage.' };
    }

    order.order_status = 'cancelled';
    await this.orderRepo.save(order);

    const cancelTl = this.timelineRepo.create({
      order_id: order.order_id.toString(),
      status: 'cancelled',
      note: 'Order has been cancelled by customer.',
    });
    await this.timelineRepo.save(cancelTl);

    return { ...BASE_OK, message: 'Order cancelled successfully.' };
  }

  async createPaymentIntent(body: any) {
    const gateway = await this.gatewayRepo.findOne({ where: { gateway_name: 'stripe', is_active: '1' } });
    if (!gateway) {
      return { status_code: 400, message: 'Stripe is not configured.' };
    }

    const config = JSON.parse(gateway.config_json || '{}');

    return {
      ...BASE_OK,
      data: {
        client_secret: 'pi_mock_secret_' + Date.now(),
        payment_intent_id: 'pi_mock_' + Date.now(),
        publishable_key: config.publishable_key || '',
        amount: body.amount,
        currency: body.currency || 'bdt',
      },
    };
  }
}
