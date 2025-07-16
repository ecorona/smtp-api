import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Mail } from 'nodemailer';
import { AppGuard } from './app.guard';
@Controller('smtp')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('send-email')
  @UseGuards(AppGuard)
  sendEmail() {
    const options: Mail.Options = {};
    return this.appService.send(options);
  }
}
