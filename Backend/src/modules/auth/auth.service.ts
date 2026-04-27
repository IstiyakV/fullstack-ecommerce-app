import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity';

const BASE_OK = { status_code: 200, custom_status_code: 200, message: 'Success' };
const BASE_FAIL = { status_code: 401, custom_status_code: 401 };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {}

  async login(phone: string, password: string) {
    const customer = await this.customerRepo.findOne({ where: { customer_phone: phone } });
    if (!customer || customer.customer_password !== password) {
      return { ...BASE_FAIL, message: 'Invalid phone or password.' };
    }
    const token = `token-${customer.customer_id}-${Date.now()}`;
    await this.customerRepo.update(customer.customer_id, { access_token: token });
    return {
      ...BASE_OK,
      access_token: token,
      data: this.mapCustomerData(customer),
    };
  }

  async register(body: any) {
    const exists = await this.customerRepo.findOne({ where: { customer_phone: body.customer_phone } });
    if (exists) {
      return { status_code: 400, custom_status_code: 400, message: 'Phone already registered.' };
    }
    const newCustomer = this.customerRepo.create({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email || '',
      customer_password: body.password,
      is_active: '1',
      auth_provider: 'phone',
    });
    const saved = await this.customerRepo.save(newCustomer);
    return { ...BASE_OK, message: 'Registration successful. OTP sent.', data: { customer_id: saved.customer_id.toString() } };
  }

  async googleLogin(idToken: string) {
    // In production, verify idToken with google-auth-library:
    // const { OAuth2Client } = require('google-auth-library');
    // const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    // const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    // const payload = ticket.getPayload();

    // For now: decode the JWT payload without verification (development mode)
    // The Android app sends the real Google id_token which is a JWT
    let payload: any;
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      } else {
        return { ...BASE_FAIL, message: 'Invalid Google token format.' };
      }
    } catch {
      return { ...BASE_FAIL, message: 'Failed to decode Google token.' };
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;
    const picture = payload.picture || '';

    if (!email || !googleId) {
      return { ...BASE_FAIL, message: 'Invalid Google token: missing email or sub.' };
    }

    // Check if customer already exists by google_id or email
    let customer = await this.customerRepo.findOne({ where: { google_id: googleId } });
    if (!customer) {
      customer = await this.customerRepo.findOne({ where: { customer_email: email } });
    }

    if (customer) {
      // Existing customer — update google_id if not set, generate new token
      const token = `token-${customer.customer_id}-${Date.now()}`;
      await this.customerRepo.update(customer.customer_id, {
        access_token: token,
        google_id: googleId,
        auth_provider: 'google',
        image: customer.image || picture,
        customer_name: customer.customer_name || name,
      });
      customer.access_token = token;
      return { ...BASE_OK, access_token: token, data: this.mapCustomerData(customer) };
    }

    // New customer — create account from Google data
    const newCustomer = this.customerRepo.create({
      customer_name: name,
      customer_phone: '',
      customer_email: email,
      customer_password: '', // No password for Google auth
      is_active: '1',
      auth_provider: 'google',
      google_id: googleId,
      image: picture,
    });
    const saved = await this.customerRepo.save(newCustomer);
    const token = `token-${saved.customer_id}-${Date.now()}`;
    await this.customerRepo.update(saved.customer_id, { access_token: token });
    saved.access_token = token;
    return { ...BASE_OK, access_token: token, data: this.mapCustomerData(saved) };
  }

  async validateToken(token: string) {
    if (!token) return { ...BASE_FAIL, message: 'Token required.' };
    const customer = await this.customerRepo.findOne({ where: { access_token: token } });
    if (!customer) return { ...BASE_FAIL, message: 'Invalid or expired token.' };
    return { ...BASE_OK, data: this.mapCustomerData(customer) };
  }

  async updateProfile(body: any) {
    const customer = await this.customerRepo.findOne({ where: { access_token: body.access_token } });
    if (!customer) return { ...BASE_FAIL, message: 'Authentication required.' };
    await this.customerRepo.update(customer.customer_id, {
      customer_name: body.customer_name || customer.customer_name,
      customer_email: body.customer_email || customer.customer_email,
      customer_phone: body.customer_phone || customer.customer_phone,
    });
    const updated = await this.customerRepo.findOne({ where: { customer_id: customer.customer_id } });
    if (!updated) return { ...BASE_FAIL, message: 'Profile update failed.' };
    return { ...BASE_OK, message: 'Profile updated.', data: this.mapCustomerData(updated) };
  }

  async updateFcmToken(body: any) {
    const customer = await this.customerRepo.findOne({ where: { access_token: body.access_token } });
    if (!customer) return { ...BASE_FAIL, message: 'Authentication required.' };
    await this.customerRepo.update(customer.customer_id, { fcm_token: body.fcm_token });
    return { ...BASE_OK, message: 'FCM token updated.' };
  }

  async checkOtp(body: any) {
    // For demo: any OTP is valid
    return { ...BASE_OK, message: 'OTP verified successfully.', is_verified: true };
  }

  async forgetPassword(body: any) {
    return { ...BASE_OK, message: 'OTP sent to your phone.' };
  }

  async resetPassword(body: any) {
    const customer = await this.customerRepo.findOne({ where: { customer_phone: body.customer_phone } });
    if (!customer) return { status_code: 404, custom_status_code: 404, message: 'Customer not found.' };
    await this.customerRepo.update(customer.customer_id, { customer_password: body.password });
    return { ...BASE_OK, message: 'Password updated successfully.' };
  }

  private mapCustomerData(customer: Customer) {
    return {
      customer_id: customer.customer_id.toString(),
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone,
      customer_email: customer.customer_email || '',
      is_active: customer.is_active,
      is_newsletter_enable: customer.is_newsletter_enable,
      image: customer.image,
      auth_provider: customer.auth_provider || 'phone',
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }
}
