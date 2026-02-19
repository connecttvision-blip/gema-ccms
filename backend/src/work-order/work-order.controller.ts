import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Headers,
  
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from "../document/s3.service";

@Controller('work-order')
export class WorkOrderController {
  constructor(
    private readonly service: WorkOrderService,
    private readonly prisma: PrismaService,
     private readonly s3Service: S3Service,
  ) {}

  // ✅ LISTAR OS (para testes e operação)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.prisma.workOrder.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ✅ DETALHAR OS
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    const item = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('WorkOrder not found');
    return item;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async startExecution(@Param('id') id: string, @Req() req: any) {
    return this.service.startExecution(id, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/finish')
  async finishExecution(@Param('id') id: string, @Req() req: any) {
    return this.service.finishExecution(id, req);
  }

  // ✅ PARALISAR (corrigido)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/paralisar')
  async paralisar(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @Req() req: any,
  ) {
    return this.service.paralisar(id, motivo, req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/retomar')
  async retomar(@Param('id') id: string, @Req() req: any) {
    return this.service.retomar(id, req);
  }

  @UseGuards(JwtAuthGuard)
@Post(':id/encerrar')
async encerrar(@Param('id') id: string, @Req() req: any) {
  return this.service.encerrarAdministrativo(id, req);
}

@Patch(':id/delay-cause')
async setDelayCause(
  @Param('id') id: string,
  @Body('delayCause') delayCause: string,
  @Req() req: any,
) {
  return this.service.setDelayCause(id, delayCause, req);
}

@Get(':id/document')
async getDocument(
  @Param('id') id: string,
  @Req() req: any,
) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return { error: 'x-tenant-id header required' };

  const wo = await this.service['prisma'].workOrder.findFirst({
    where: { id, tenantId },
  });

  if (!wo || !wo.documentKey) {
    return { error: 'Documento não encontrado' };
  }

  const url = await this.s3Service.getSignedDownloadUrl(wo.documentKey, 300);

  await this.service['prisma'].auditLog.create({
    data: {
      tenantId,
      userId: req.user?.sub ?? null,
      entity: 'WorkOrder',
      entityId: id,
      action: 'DOCUMENT_ACCESS',
    },
  });

  return { url };
}
}
