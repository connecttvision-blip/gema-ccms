import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PreventiveScheduler {
  private readonly logger = new Logger(PreventiveScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  // A cada 1 minuto (teste). Depois ajustamos para diário/horário.
@Cron('* * * * *')
async run() {
  const now = new Date();

  // 1) Planos por TEMPO vencidos
  const dueTimePlans = await this.prisma.preventivePlan.findMany({
    where: { ativo: true, tipo: 'Tempo' as any, proximaExecucao: { lte: now } },
    orderBy: { proximaExecucao: 'asc' },
    take: 50,
  });

  for (const plan of dueTimePlans) {
    const existing = await this.prisma.workOrder.findFirst({
      where: {
        tenantId: plan.tenantId,
        preventivePlanId: plan.id,
        status: { in: ['Aberta', 'Planejada', 'EmExecucao', 'Paralisada'] as any },
      },
    });
   if (existing) {
  await this.prisma.preventivePlan.update({
    where: { id: plan.id },
    data: { statusPlano: 'Atrasado' as any },
  });
  continue;
}

    await this.prisma.workOrder.create({
      data: {
        tenantId: plan.tenantId,
        assetId: plan.assetId,
        title: `Preventiva: ${plan.name}`,
        description: plan.description ?? 'Gerada automaticamente pela agenda preventiva',
        priority: 'Média',
        status: 'Planejada' as any,
        preventivePlanId: plan.id,
      },
    });

    await this.prisma.preventivePlan.update({
    where: { id: plan.id },
    data: { statusPlano: 'EmDia' as any },
    });

    const ultimaExecucao = now;
    let proximaExecucao: Date | null = null;

    if (plan.intervaloDias !== null && plan.intervaloDias !== undefined) {
      proximaExecucao = new Date();
      proximaExecucao.setDate(now.getDate() + plan.intervaloDias);
    }

    await this.prisma.preventivePlan.update({
      where: { id: plan.id },
      data: { ultimaExecucao, proximaExecucao },
    });
  }

  // 2) Planos por HORIMETRO
  const hourPlans = await this.prisma.preventivePlan.findMany({
    where: { ativo: true, tipo: 'Horimetro' as any },
    take: 50,
  });

  for (const plan of hourPlans) {
    if (plan.intervaloHoras === null || plan.intervaloHoras === undefined) continue;

    const latest = await this.prisma.assetMeterReading.findFirst({
      where: {
        tenantId: plan.tenantId,
        assetId: plan.assetId,
        meterType: 'Horimetro' as any,
      },
      orderBy: { readingAt: 'desc' },
    });

    if (!latest) continue;

    // Inicializa baseline
    if (plan.ultimaLeituraHoras === null || plan.ultimaLeituraHoras === undefined) {
      await this.prisma.preventivePlan.update({
        where: { id: plan.id },
        data: { ultimaLeituraHoras: latest.value },
      });
      continue;
    }

    const delta = latest.value - plan.ultimaLeituraHoras;
    if (delta < plan.intervaloHoras) continue;

    // bloqueio (Opção C)
    const existing = await this.prisma.workOrder.findFirst({
      where: {
        tenantId: plan.tenantId,
        preventivePlanId: plan.id,
        status: { in: ['Aberta', 'Planejada', 'EmExecucao', 'Paralisada'] as any },
      },
    });
   if (existing) {
  await this.prisma.preventivePlan.update({
    where: { id: plan.id },
    data: { statusPlano: 'Atrasado' as any },
  });
  continue;
}
    await this.prisma.workOrder.create({
      data: {
        tenantId: plan.tenantId,
        assetId: plan.assetId,
        title: `Preventiva: ${plan.name}`,
        description: plan.description ?? 'Gerada automaticamente por horímetro',
        priority: 'Média',
        status: 'Planejada' as any,
        preventivePlanId: plan.id,
      },
    });

    await this.prisma.preventivePlan.update({
  where: { id: plan.id },
  data: { statusPlano: 'EmDia' as any },
});

    await this.prisma.preventivePlan.update({
      where: { id: plan.id },
      data: {
        ultimaExecucao: now,
        ultimaLeituraHoras: latest.value,
      },
    });
  }
}}