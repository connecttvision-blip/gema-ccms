import { Module } from '@nestjs/common'
import { LineService } from './line.service'
import { LineController } from './line.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [LineController],
  providers: [LineService],
})
export class LineModule {}