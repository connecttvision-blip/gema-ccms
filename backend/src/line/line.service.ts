import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class LineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; areaId: string }) {
    return this.prisma.line.create({
      data: {
        name: data.name,
        areaId: data.areaId,
        tenantId,
      },
    })
  }

  async findAll(tenantId: string, areaId?: string) {
    return this.prisma.line.findMany({
      where: {
        tenantId,
        ...(areaId ? { areaId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(tenantId: string, id: string, data: { name?: string }) {
    return this.prisma.line.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.line.deleteMany({
      where: { id, tenantId },
    })
  }
}
