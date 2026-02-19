import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from "../document/document.service";

@Injectable()
export class WorkOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryMovementService: InventoryMovementService,
    private readonly documentService: DocumentService,
  ) {}

  private async logStatusChange(params: {
    tenantId: string;
    workOrderId: string;
    changedById: string;
    fromStatus: any;
    toStatus: any;
  }) {
    const { tenantId, workOrderId, changedById, fromStatus, toStatus } = params;

    if (fromStatus === toStatus) return;

    await this.prisma.workOrderStatusHistory.create({
      data: {
        tenantId,
        workOrderId,
        changedById,
        fromStatus,
        toStatus,
      },
    });
  }

  async startExecution(workOrderId: string, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.sub;

    if (!tenantId) return { error: 'x-tenant-id header required' };

    await this.ensureNotClosed(workOrderId, tenantId);

    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
    });
    if (!wo) return { error: 'WorkOrder not found' };

    if (wo.status === 'Encerrada') {
      return { error: 'WorkOrder já está Encerrada e não pode ser alterada.' };
    }

    const activeExecution = await this.prisma.workOrderExecution.findFirst({
      where: { workOrderId, tenantId, finishedAt: null },
    });
    if (activeExecution) return { error: 'WorkOrder already in execution' };

    const reservations = await this.prisma.inventoryReservation.findMany({
      where: {
        workOrderId,
        tenantId,
        status: { in: ['Reservada', 'Parcial'] },
      },
    });

    let situacaoMaterial: 'Completo' | 'Parcial' | 'Indisponivel' = 'Completo';

    if (reservations.length > 0) {
      const hasPartial = reservations.some((r) => r.status === 'Parcial');
      if (hasPartial) situacaoMaterial = 'Parcial';
    } else {
      situacaoMaterial = 'Indisponivel';
    }

    const execution = await this.prisma.workOrderExecution.create({
      data: {
        workOrderId,
        executorId: userId,
        startedAt: new Date(),
        tenantId,
      },
    });

    await this.prisma.workOrder.updateMany({
      where: { id: workOrderId, tenantId },
      data: {
        status: 'EmExecucao',
        situacaoMaterial,
      },
    });

    await this.logStatusChange({
      tenantId,
      workOrderId,
      changedById: userId,
      fromStatus: wo.status,
      toStatus: 'EmExecucao',
    });

    return execution;
  }

  async finishExecution(workOrderId: string, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.sub;

    if (!tenantId) return { error: 'x-tenant-id header required' };

    await this.ensureNotClosed(workOrderId, tenantId);

    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
    });
    if (!wo) return { error: 'WorkOrder not found' };

    if (wo.status === 'Encerrada') {
      return { error: 'WorkOrder já está Encerrada.' };
    }

    const activeExecution = await this.prisma.workOrderExecution.findFirst({
      where: { workOrderId, tenantId, finishedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeExecution) {
      return { error: 'No active execution found for this WorkOrder' };
    }

    if (activeExecution.executorId !== userId) {
      return { error: 'Only the executor can finish this execution' };
    }

    const finishedAt = new Date();
    const totalMinutes = Math.max(
      0,
      Math.round(
        (finishedAt.getTime() - activeExecution.startedAt.getTime()) / 60000,
      ),
    );

    const updatedExecution = await this.prisma.workOrderExecution.update({
      where: { id: activeExecution.id },
      data: { finishedAt, totalMinutes },
    });

    await this.prisma.workOrder.updateMany({
      where: { id: workOrderId, tenantId },
      data: {
        status: 'FinalizadaExecucao',
        situacaoMaterial: 'Completo',
      },
    });

    await this.logStatusChange({
      tenantId,
      workOrderId,
      changedById: userId,
      fromStatus: wo.status,
      toStatus: 'FinalizadaExecucao',
    });

    return updatedExecution;
  }

  async paralisar(workOrderId: string, motivo: string, req: any) {
  const tenantId = req.headers['x-tenant-id'];
  const userId = req.user?.sub;

  if (!tenantId) return { error: 'x-tenant-id header required' };

  await this.ensureNotClosed(workOrderId, tenantId);

  if (!motivo) return { error: 'Motivo da paralisação é obrigatório' };

  const wo = await this.prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId },
  });
  if (!wo) return { error: 'WorkOrder not found' };

  if (wo.status === 'Encerrada') {
    return { error: 'WorkOrder já está Encerrada.' };
  }

  const updated = await this.prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: 'Paralisada',
      motivoParalisacao: motivo,
      paralisadoEm: new Date(),
      situacaoMaterial: 'Indisponivel',
    },
  });

  await this.logStatusChange({
    tenantId,
    workOrderId,
    changedById: userId,
    fromStatus: wo.status,
    toStatus: 'Paralisada',
  });

  return updated;
}

async retomar(workOrderId: string, req: any) {
  const tenantId = req.headers['x-tenant-id'];
  const userId = req.user?.sub;

  if (!tenantId) return { error: 'x-tenant-id header required' };

  await this.ensureNotClosed(workOrderId, tenantId);

  const wo = await this.prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId },
  });
  if (!wo) return { error: 'WorkOrder not found' };

  if (wo.status === 'Encerrada') {
    return { error: 'WorkOrder já está Encerrada.' };
  }

  if (wo.status !== 'Paralisada') {
    return { error: 'WorkOrder não está Paralisada' };
  }

  const updated = await this.prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: 'EmExecucao',
      paralisadoEm: null,
      motivoParalisacao: null,
      situacaoMaterial: 'Indisponivel',
    },
  });

  await this.logStatusChange({
    tenantId,
    workOrderId,
    changedById: userId,
    fromStatus: wo.status,
    toStatus: 'EmExecucao',
  });

  return updated;
}

  async encerrarAdministrativo(workOrderId: string, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.sub;

    if (!tenantId) return { error: 'x-tenant-id header required' };

    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
      include: { asset: true, tenant: true },
    });

    if (!wo) return { error: 'WorkOrder not found' };

    // 🔒 BLOCO 5.3 — IMUTABILIDADE REAL
    if (wo.status === 'Encerrada') {
      return { error: 'WorkOrder já está Encerrada.' };
    }

    if (wo.documentKey || wo.documentHash || wo.documentGeneratedAt) {
      return { error: 'Documento oficial já foi gerado para esta OS.' };
    }

    if (wo.status !== 'FinalizadaExecucao') {
      return { error: 'Somente OS FinalizadaExecucao pode ser Encerrada.' };
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'Encerrada' },
    });

    await this.logStatusChange({
      tenantId,
      workOrderId,
      changedById: userId,
      fromStatus: wo.status,
      toStatus: 'Encerrada',
    });

    const { sha256, documentKey } =
      await this.documentService.generateWorkOrderPdfBuffer({
        tenantName: wo.tenant.name,
        tenantId: tenantId,
        workOrderId: wo.id,
        title: wo.title,
        description: wo.description,
        status: 'Encerrada',
        priority: wo.priority,
        assetName: wo.asset.name,
        createdAt: wo.createdAt.toLocaleString('pt-BR'),
        closedAt: new Date().toLocaleString('pt-BR'),
      });

    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        documentKey,
        documentHash: sha256,
        documentGeneratedAt: new Date(),
      },
    });

    return updated;
  }

  private async ensureNotClosed(workOrderId: string, tenantId: string) {
  const wo = await this.prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId },
    select: { status: true },
  });

  if (!wo) throw new Error('WorkOrder not found');

  if (wo.status === 'Encerrada') {
    throw new Error('WorkOrder Encerrada é imutável.');
  }
}

  async setDelayCause(workOrderId: string, delayCause: string, req: any) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) return { error: 'x-tenant-id header required' };

    await this.ensureNotClosed(workOrderId, tenantId);

    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
    });
    if (!wo) return { error: 'WorkOrder not found' };

    if (wo.status === 'Encerrada') {
      return { error: 'WorkOrder já está Encerrada.' };
    }

    const allowed = [
      'Logistica',
      'AguardandoPeca',
      'Terceiro',
      'JanelaOperacional',
      'FaltaMaoDeObra',
      'Engenharia',
      'Outros',
    ];

    if (!allowed.includes(delayCause)) {
      return { error: 'delayCause inválido' };
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { delayCause: delayCause as any },
    });
  }
}