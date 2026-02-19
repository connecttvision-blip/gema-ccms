import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PreventiveService } from './preventive.service';

@Controller('preventive')
export class PreventiveController {
  constructor(private readonly preventiveService: PreventiveService) {}

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.preventiveService.create(tenantId, body);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.preventiveService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.preventiveService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.preventiveService.update(tenantId, id, body);
  }

  @Delete(':id')
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.preventiveService.remove(tenantId, id);
  }
}