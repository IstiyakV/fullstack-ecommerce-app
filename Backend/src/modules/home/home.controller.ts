import { Controller, Post, Body } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('api/v1/customer')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Post('home')
  getHome(@Body() body: any) {
    return this.homeService.getHomeData();
  }
}
