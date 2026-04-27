import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/health')
export class AppController {
  @Get()
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'Shopperz Mart API is completely operational! 🚀',
      timestamp: new Date().toISOString()
    };
  }
}
