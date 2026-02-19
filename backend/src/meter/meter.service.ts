import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeterService {
  constructor(private readonly prisma: PrismaService) {}

  async createReading(tenantId: string, data: any) {
    if (!data.assetId) throw new BadRequestException('assetId obrigatório');
    if (data.value === undefined || data.value === null)
      throw new BadRequestException('value obrigatório');

    // leitura acumulada (horas totais) deve ser >= 0
    if (Number(data.value) < 0) throw new BadRequestException('value inválido');

    return this.prisma.assetMeterReading.create({
      data: {
        tenantId,
        assetId: data.assetId,
        meterType: data.meterType ?? 'Horimetro',
        source: data.source ?? 'Manual',
        value: Number(data.value),
        readingAt: data.readingAt ? new Date(data.readingAt) : new Date(),
        externalRef: data.externalRef ?? null,
        note: data.note ?? null,
      },
    });
  }

  async listReadings(tenantId: string, assetId: string) {
    return this.prisma.assetMeterReading.findMany({
      where: { tenantId, assetId },
      orderBy: { readingAt: 'desc' },
      take: 50,
    });
  }

  async getLatest(tenantId: string, assetId: string) {
    return this.prisma.assetMeterReading.findFirst({
      where: { tenantId, assetId },
      orderBy: { readingAt: 'desc' },
    });
  }
}