import { MetricsModule } from './metrics/metrics.module';
import { PreventiveModule } from './preventive/preventive.module';
import { PurchaseRequestModule } from './purchase-request/purchase-request.module';
import { InventoryMovementModule } from './inventory-movement/inventory-movement.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AssetModule } from './asset/asset.module';
import { PlantModule } from './plant/plant.module';
import { AreaModule } from './area/area.module';
import { LineModule } from './line/line.module';
import { TicketModule } from './ticket/ticket.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { InventoryItemModule } from './inventory-item/inventory-item.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MeterModule } from './meter/meter.module';
import { DocumentModule } from "./document/document.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AssetModule,
    PlantModule,
    AreaModule,
    LineModule,
    TicketModule,
    WorkOrderModule,
    InventoryItemModule,
    InventoryMovementModule,
    PurchaseRequestModule,
    PreventiveModule,
    ScheduleModule.forRoot(),
    MeterModule,
    MetricsModule,
    DocumentModule,

  ],
  controllers: [AppController],
})
export class AppModule {}