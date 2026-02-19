import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateOrNull(value?: string) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  async mttrByAsset(assetId: string, from: string | undefined, to: string | undefined, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) return { error: 'x-tenant-id header required' };

    const fromDate = this.parseDateOrNull(from);
    const toDate = this.parseDateOrNull(to);

    const where: any = {
      tenantId,
      status: 'Encerrada',
      preventivePlanId: null,
      assetId,
    };

    if (fromDate || toDate) {
      where.updatedAt = {};
      if (fromDate) where.updatedAt.gte = fromDate;
      if (toDate) where.updatedAt.lte = toDate;
    }

    const workOrders = await this.prisma.workOrder.findMany({
      where,
      select: {
        id: true,
        executions: { select: { totalMinutes: true } },
      },
    });

    const minutes: number[] = [];
    for (const wo of workOrders) {
      for (const ex of wo.executions) {
        if (typeof ex.totalMinutes === 'number') minutes.push(ex.totalMinutes);
      }
    }

    if (minutes.length === 0) return { assetId, mttrMinutes: 0, mttrHours: 0, count: 0 };

    const sum = minutes.reduce((a, b) => a + b, 0);
    const mttrMinutes = Math.round(sum / minutes.length);

    return {
      assetId,
      mttrMinutes,
      mttrHours: Number((mttrMinutes / 60).toFixed(2)),
      count: minutes.length,
    };
  }

  async mttrGlobal(from: string | undefined, to: string | undefined, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) return { error: 'x-tenant-id header required' };

    const fromDate = this.parseDateOrNull(from);
    const toDate = this.parseDateOrNull(to);

    const where: any = {
      tenantId,
      status: 'Encerrada',
      preventivePlanId: null,
    };

    if (fromDate || toDate) {
      where.updatedAt = {};
      if (fromDate) where.updatedAt.gte = fromDate;
      if (toDate) where.updatedAt.lte = toDate;
    }

    const workOrders = await this.prisma.workOrder.findMany({
      where,
      select: {
        executions: { select: { totalMinutes: true } },
      },
    });

    const minutes: number[] = [];
    for (const wo of workOrders) {
      for (const ex of wo.executions) {
        if (typeof ex.totalMinutes === 'number') minutes.push(ex.totalMinutes);
      }
    }

    if (minutes.length === 0) return { mttrMinutes: 0, mttrHours: 0, count: 0 };

    const sum = minutes.reduce((a, b) => a + b, 0);
    const mttrMinutes = Math.round(sum / minutes.length);

    return {
      mttrMinutes,
      mttrHours: Number((mttrMinutes / 60).toFixed(2)),
      count: minutes.length,
    };
  }

  async mtbfByAsset(assetId: string, from: string | undefined, to: string | undefined, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) return { error: 'x-tenant-id header required' };

    const fromDate = this.parseDateOrNull(from);
    const toDate = this.parseDateOrNull(to);

    const where: any = {
      tenantId,
      status: 'Encerrada',
      preventivePlanId: null,
      assetId,
    };

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const workOrders = await this.prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: { id: true, createdAt: true },
    });

    if (workOrders.length < 2) {
      return { assetId, mtbfMinutes: 0, mtbfHours: 0, intervalsCount: 0, workOrdersCount: workOrders.length };
    }

    const intervalsMinutes: number[] = [];
    for (let i = 1; i < workOrders.length; i++) {
      const prev = workOrders[i - 1].createdAt.getTime();
      const curr = workOrders[i].createdAt.getTime();
      intervalsMinutes.push(Math.max(0, Math.round((curr - prev) / 60000)));
    }

    const sum = intervalsMinutes.reduce((a, b) => a + b, 0);
    const mtbfMinutes = Math.round(sum / intervalsMinutes.length);

    return {
      assetId,
      mtbfMinutes,
      mtbfHours: Number((mtbfMinutes / 60).toFixed(2)),
      intervalsCount: intervalsMinutes.length,
      workOrdersCount: workOrders.length,
    };
  }

  async mtbfGlobal(from: string | undefined, to: string | undefined, req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) return { error: 'x-tenant-id header required' };

    const fromDate = this.parseDateOrNull(from);
    const toDate = this.parseDateOrNull(to);

    const assets = await this.prisma.asset.findMany({
      where: { tenantId },
      select: { id: true },
    });

    const mtbfMinutesList: number[] = [];

    for (const a of assets) {
      const where: any = {
        tenantId,
        status: 'Encerrada',
        preventivePlanId: null,
        assetId: a.id,
      };

      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = fromDate;
        if (toDate) where.createdAt.lte = toDate;
      }

      const wos = await this.prisma.workOrder.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });

      if (wos.length < 2) continue;

      const intervalsMinutes: number[] = [];
      for (let i = 1; i < wos.length; i++) {
        const prev = wos[i - 1].createdAt.getTime();
        const curr = wos[i].createdAt.getTime();
        intervalsMinutes.push(Math.max(0, Math.round((curr - prev) / 60000)));
      }

      const sum = intervalsMinutes.reduce((a2, b2) => a2 + b2, 0);
      const mtbfAsset = Math.round(sum / intervalsMinutes.length);
      mtbfMinutesList.push(mtbfAsset);
    }

    if (mtbfMinutesList.length === 0) {
      return { mtbfMinutes: 0, mtbfHours: 0, assetsCount: assets.length, assetsWithData: 0 };
    }

    const sum = mtbfMinutesList.reduce((a, b) => a + b, 0);
    const mtbfMinutes = Math.round(sum / mtbfMinutesList.length);

    return {
      mtbfMinutes,
      mtbfHours: Number((mtbfMinutes / 60).toFixed(2)),
      assetsCount: assets.length,
      assetsWithData: mtbfMinutesList.length,
    };
  }

    async availabilityByAsset(assetId: string, from: string | undefined, to: string | undefined, req: any) {
    const mttr = await this.mttrByAsset(assetId, from, to, req);
    const mtbf = await this.mtbfByAsset(assetId, from, to, req);

    if (!mttr || !mtbf) return { error: 'Erro no cálculo base' };

    const mttrMinutes = mttr.mttrMinutes ?? 0;
    const mtbfMinutes = mtbf.mtbfMinutes ?? 0;

    if (mtbfMinutes === 0 && mttrMinutes === 0) {
      return {
        assetId,
        availability: 0,
        availabilityPercent: 0,
      };
    }

    const availability = mtbfMinutes / (mtbfMinutes + mttrMinutes);

    return {
      assetId,
      mttrMinutes,
      mtbfMinutes,
      availability: Number(availability.toFixed(4)),
      availabilityPercent: Number((availability * 100).toFixed(2)),
    };
  }

  async delaysByCause(slaHours: string | undefined, req: any) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return { error: 'x-tenant-id header required' };

  const sla = Math.max(0.01, Number(slaHours ?? 24)); // default 24h (mín 0.01h)

  const cutoff = new Date(Date.now() - sla * 60 * 60 * 1000);

  // Corretivas em atraso: não encerradas, preventivo null, abertas antes do cutoff
  const delayed = await this.prisma.workOrder.findMany({
    where: {
      tenantId,
      preventivePlanId: null,
      status: { not: 'Encerrada' },
      createdAt: { lt: cutoff },
    },
    select: { delayCause: true },
  });

  const total = delayed.length;

  const counts: Record<string, number> = {};
  for (const d of delayed) {
    const key = d.delayCause ?? 'NaoInformado';
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const breakdown = Object.entries(counts)
    .map(([cause, count]) => ({
      cause,
      count,
      percent: total === 0 ? 0 : Number(((count / total) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    slaHours: sla,
    totalDelayed: total,
    breakdown,
  };
}

async delaysByPriority(req: any) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return { error: 'x-tenant-id header required' };

  const slaMap: Record<string, number> = {
    Alta: 8,
    Média: 24,
    Baixa: 72,
  };

  const closed = await this.prisma.workOrder.findMany({
    where: {
      tenantId,
      status: 'Encerrada',
    },
    select: {
      id: true,
      priority: true,
      executions: {
        select: {
          startedAt: true,
          finishedAt: true,
        },
      },
    },
  });

  const result: Record<string, { total: number; delayed: number }> = {};

  for (const wo of closed) {
    const exec = wo.executions?.[0];
    if (!exec?.startedAt || !exec?.finishedAt) continue;

    const diffHours =
      (new Date(exec.finishedAt).getTime() -
        new Date(exec.startedAt).getTime()) /
      3600000;

    const sla = slaMap[wo.priority] ?? 24;

    if (!result[wo.priority]) {
      result[wo.priority] = { total: 0, delayed: 0 };
    }

    result[wo.priority].total += 1;
    if (diffHours > sla) {
      result[wo.priority].delayed += 1;
    }
  }

  const breakdown = Object.entries(result).map(([priority, data]) => ({
    priority,
    total: data.total,
    delayed: data.delayed,
    percent:
      data.total > 0
        ? Number(((data.delayed / data.total) * 100).toFixed(2))
        : 0,
  }));

  return breakdown;
}

async backlogByStatus(req: any) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return { error: 'x-tenant-id header required' };

  const result = await this.prisma.workOrder.groupBy({
    by: ['status'],
    where: {
      tenantId,
      status: {
        not: 'Encerrada',
      },
    },
    _count: {
      status: true,
    },
  });

  return result.map((r) => ({
    status: r.status,
    total: r._count.status,
  }));
}

async paralisadasPorCausa(req: any) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return { error: 'x-tenant-id header required' };

  const totalParalisadas = await this.prisma.workOrder.count({
    where: { tenantId, status: 'Paralisada' },
  });

  const grouped = await this.prisma.workOrder.groupBy({
    by: ['delayCause'],
    where: { tenantId, status: 'Paralisada' },
    _count: { _all: true },
  });

  const items = grouped.map((g) => {
    const total = g._count._all;
    const pct =
      totalParalisadas > 0
        ? Math.round((total / totalParalisadas) * 10000) / 100
        : 0;

    return {
      delayCause: g.delayCause ?? 'SemCausa',
      total,
      pct,
    };
  });

  return {
    totalParalisadas,
    items,
  };
}

async tempoMedioParalisada(req: any) {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return { error: 'x-tenant-id header required' };

  // pega últimos eventos de "Paralisada" (histórico)
  const events = await this.prisma.workOrderStatusHistory.findMany({
    where: { tenantId, toStatus: 'Paralisada' as any },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: { workOrderId: true, createdAt: true },
  });

  let totalMinutes = 0;
  let count = 0;

  for (const ev of events) {
    // procura o próximo status depois da paralisação
    const next = await this.prisma.workOrderStatusHistory.findFirst({
      where: {
        tenantId,
        workOrderId: ev.workOrderId,
        createdAt: { gt: ev.createdAt },
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    if (!next) continue;

    const minutes = Math.max(
      0,
      Math.round((next.createdAt.getTime() - ev.createdAt.getTime()) / 60000),
    );

    totalMinutes += minutes;
    count += 1;
  }

  const avgMinutes = count > 0 ? Math.round(totalMinutes / count) : 0;

  return {
    samples: count,
    avgMinutes,
  };
}
}