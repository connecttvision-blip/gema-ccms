import { Module } from '@nestjs/common';
import { WorkOrderController } from './work-order.controller';
import { WorkOrderService } from './work-order.service';
import { InventoryMovementModule } from '../inventory-movement/inventory-movement.module';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentModule } from "../document/document.module";

@Module({
  imports: [InventoryMovementModule, DocumentModule],
  controllers: [WorkOrderController],
  providers: [WorkOrderService, PrismaService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}