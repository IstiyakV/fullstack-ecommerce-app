import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomerAuthGuard } from '../../common/guards/customer-auth.guard';

@Controller('api/v1/customer')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.customer_phone, body.password);
  }

  @Post('google-login')
  googleLogin(@Body() body: any) {
    return this.authService.googleLogin(body.id_token);
  }

  @Post('android-registration')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('android-check-otp')
  checkOtp(@Body() body: any) {
    return this.authService.checkOtp(body);
  }

  @Post('reset-pass/otp')
  forgetPassword(@Body() body: any) {
    return this.authService.forgetPassword(body);
  }

  @Post('reset-pass/check-otp')
  resetOtp(@Body() body: any) {
    return this.authService.checkOtp(body);
  }

  @Post('reset-pass')
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  @Post('validate-token')
  validateToken(@Body() body: any) {
    return this.authService.validateToken(body.access_token);
  }

  @Post('profile-update')
  @UseGuards(CustomerAuthGuard)
  updateProfile(@Body() body: any) {
    return this.authService.updateProfile(body);
  }

  @Post('update-fcm-token')
  @UseGuards(CustomerAuthGuard)
  updateFcmToken(@Body() body: any) {
    return this.authService.updateFcmToken(body);
  }
}
