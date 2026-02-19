import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/roles/roles.decorator';
import { Role } from './auth/roles/roles.enum';
import { PrismaService } from './prisma/prisma.service';
import { withTenant } from './prisma/prisma-tenant.extension';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GESTOR)
  @Get()
  async getUsers(@Req() req: any) {
    const prismaTenant = withTenant(this.prisma, req.user.tenantId);
    return prismaTenant.user.findMany();
  }
}