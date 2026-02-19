import { Module } from '@nestjs/common';
import { MeterService } from './meter.service';
import { MeterController } from './meter.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MeterController],
  providers: [MeterService, PrismaService],
})
export class MeterModule {}