import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Req() req: Request, @Body() body: LoginDto) {
    const tenantId = (req as any).tenantId;

    const user = await this.authService.validateUser(
      body.email,
      body.password,
      tenantId,
    );

    return this.authService.login(user);
  }
}