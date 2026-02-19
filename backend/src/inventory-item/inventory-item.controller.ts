import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory-item')
export class InventoryItemController {
  constructor(private readonly service: InventoryItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reserve')
  async reserve(@Body() body: any, @Req() req: any) {
    return this.service.reserveItem(body, req);
  }
}