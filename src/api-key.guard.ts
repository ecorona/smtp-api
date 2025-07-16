import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from './config-keys.enum';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || apiKey !== this.configService.get(ConfigKeys.API_KEY)) {
      throw new UnauthorizedException('Invalid or missing x-api-key');
    }

    return true;
  }
}
