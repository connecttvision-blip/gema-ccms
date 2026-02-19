import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PurchaseRequestService } from './purchase-request.service';

@Module({
  imports: [PrismaModule],
  providers: [PurchaseRequestService],
  exports: [PurchaseRequestService],
})
export class PurchaseRequestModule {}