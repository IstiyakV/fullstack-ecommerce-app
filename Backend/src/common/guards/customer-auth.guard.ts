import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Attempt to extract token from body first (legacy behavior), fallback to Auth Header
    const token = request.body?.access_token || 
                  (request.headers['authorization']?.startsWith('Bearer ') 
                     ? request.headers['authorization'].split(' ')[1] 
                     : null);

    if (!token) {
      throw new UnauthorizedException({ status_code: 401, message: 'Authentication token is missing. Please login.' });
    }

    const customer = await this.customerRepo.findOne({ where: { access_token: token } });
    if (!customer) {
      throw new UnauthorizedException({ status_code: 401, message: 'Invalid or expired authentication token. Please login again.' });
    }

    // Forcefully inject the absolute, verified truth into the request payload.
    // This overrules any spoofed ID sent by the frontend automatically.
    if (!request.body) request.body = {};
    request.body.user_key = customer.customer_id.toString();
    request.body.customer_id = customer.customer_id.toString();
    
    // Standard NestJS user injection for potentially other usages later
    request.user = customer;

    return true;
  }
}
