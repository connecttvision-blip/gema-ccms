import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { MeterService } from './meter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('meter')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  @UseGuards(JwtAuthGuard)
  @Post('readings')
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.meterService.createReading(tenantId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('readings/:assetId')
  list(@Headers('x-tenant-id') tenantId: string, @Param('assetId') assetId: string) {
    return this.meterService.listReadings(tenantId, assetId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('readings/:assetId/latest')
  latest(@Headers('x-tenant-id') tenantId: string, @Param('assetId') assetId: string) {
    return this.meterService.getLatest(tenantId, assetId);
  }
}