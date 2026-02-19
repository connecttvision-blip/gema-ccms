import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  create(data: any, tenantId: string) {
    return this.prisma.asset.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.asset.findMany({
      where: { tenantId },
    });
  }

  update(id: string, data: any, tenantId: string) {
    return this.prisma.asset.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  remove(id: string, tenantId: string) {
    return this.prisma.asset.deleteMany({
      where: { id, tenantId },
    });
  }
}