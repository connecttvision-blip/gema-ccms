import { Body, Controller, Headers, Post } from '@nestjs/common';
import { InventoryMovementService } from './inventory-movement.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { CreateConsumeDto } from './dto/create-consume.dto';

@Controller('inventory-movements')
export class InventoryMovementController {
  constructor(private readonly service: InventoryMovementService) {}

  @Post('withdraw')
  async withdraw(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateWithdrawDto,
  ) {
    return this.service.withdraw(tenantId, dto);
  }

  @Post('consume')
  async consume(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateConsumeDto,
  ) {
    return this.service.consume(tenantId, dto);
  }
}