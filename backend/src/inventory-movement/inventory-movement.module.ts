import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PurchaseRequestModule } from '../purchase-request/purchase-request.module';
import { InventoryMovementController } from './inventory-movement.controller';
import { InventoryMovementService } from './inventory-movement.service';

@Module({
  imports: [PrismaModule, PurchaseRequestModule],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService],
  exports: [InventoryMovementService],
})
export class InventoryMovementModule {}