import { Module } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';
import { InventoryItemController } from './inventory-item.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InventoryItemController],
  providers: [InventoryItemService, PrismaService],
})
export class InventoryItemModule {}