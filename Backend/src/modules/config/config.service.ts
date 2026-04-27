import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../../database/entities/city.entity';
import { ShippingZone } from '../../database/entities/shipping-zone.entity';
import { AppConfig } from '../../database/entities/app-config.entity';
import { PaymentGateway } from '../../database/entities/payment-gateway.entity';

const BASE_OK = { status_code: 200, custom_status_code: 200, message: 'Success' };

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(ShippingZone) private zoneRepo: Repository<ShippingZone>,
    @InjectRepository(AppConfig) private configRepo: Repository<AppConfig>,
    @InjectRepository(PaymentGateway) private gatewayRepo: Repository<PaymentGateway>,
  ) {}

  async getCities() {
    const cities = await this.cityRepo.find({
      where: { is_active: '1' },
      order: { city_name: 'ASC' },
    });
    return { ...BASE_OK, data: cities };
  }

  async getShippingZones() {
    const zones = await this.zoneRepo.find({
      where: { is_active: '1' },
    });
    return { ...BASE_OK, data: zones };
  }

  async getShippingZoneForCity(cityId: string) {
    const city = await this.cityRepo.findOne({ where: { city_id: cityId } });
    if (!city) return { status_code: 404, message: 'City not found.' };

    const zone = await this.zoneRepo.findOne({ where: { zone_id: city.shipping_zone_id } });
    if (!zone) return { status_code: 404, message: 'Shipping zone not found.' };

    return { ...BASE_OK, data: { city, shipping_zone: zone } };
  }

  async getAppConfig() {
    const configs = await this.configRepo.find();
    const configMap: Record<string, string> = {};
    configs.forEach(c => { configMap[c.config_key] = c.config_value; });
    return { ...BASE_OK, data: configMap };
  }

  async getPaymentGateways() {
    const gateways = await this.gatewayRepo.find({
      where: { is_active: '1' },
      order: { sort_order: 'ASC' },
    });
    return { ...BASE_OK, data: gateways };
  }
}
