import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Mail } from 'nodemailer';
import { ApiKeyGuard } from './api-key.guard';
@Controller('smtp')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('send-email')
  @UseGuards(ApiKeyGuard)
  sendEmail() {
    const options: Mail.Options = {};
    return this.appService.send(options);
  }
}
