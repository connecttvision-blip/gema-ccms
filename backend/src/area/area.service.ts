import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AreaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; plantId: string }) {
    return this.prisma.area.create({
      data: {
        name: data.name,
        plantId: data.plantId,
        tenantId,
      },
    })
  }

  async findAll(tenantId: string, plantId?: string) {
    return this.prisma.area.findMany({
      where: {
        tenantId,
        ...(plantId ? { plantId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(tenantId: string, id: string, data: { name?: string }) {
    return this.prisma.area.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.area.deleteMany({
      where: { id, tenantId },
    })
  }
}