import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PreventiveService {
  constructor(private readonly prisma: PrismaService) {}

 async create(tenantId: string, data: any) {
  const now = new Date();
  let proximaExecucao: Date | null = null;

  if (data.tipo === 'Tempo' && data.intervaloDias) {
    proximaExecucao = new Date();
    proximaExecucao.setDate(now.getDate() + data.intervaloDias);
  }

  return this.prisma.preventivePlan.create({
    data: {
      ...data,
      tenantId,
      proximaExecucao,
    },
  });
}

  async findAll(tenantId: string) {
    return this.prisma.preventivePlan.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.preventivePlan.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('PreventivePlan not found');
    return item;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.preventivePlan.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.preventivePlan.delete({
      where: { id },
    });
  }
}