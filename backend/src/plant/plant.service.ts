import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PlantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string }) {
    return this.prisma.plant.create({
      data: {
        name: data.name,
        tenantId,
      },
    })
  }

  async findAll(tenantId: string) {
    return this.prisma.plant.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(tenantId: string, id: string, data: { name?: string }) {
    return this.prisma.plant.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.plant.deleteMany({
      where: { id, tenantId },
    })
  }
}