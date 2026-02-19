import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: { title: string; description?: string; priority?: string; assetId: string },
  ) {
    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? 'Média',
        assetId: data.assetId,
        tenantId,
      },
    })
  }

  async findAll(tenantId: string, assetId?: string) {
    return this.prisma.ticket.findMany({
      where: {
        tenantId,
        ...(assetId ? { assetId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(
    tenantId: string,
    id: string,
    data: { title?: string; description?: string; status?: string; priority?: string },
  ) {
    return this.prisma.ticket.updateMany({
      where: { id, tenantId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
      },
    })
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.ticket.deleteMany({
      where: { id, tenantId },
    })
  }

  async convertToWorkOrder(
    tenantId: string,
    ticketId: string,
    data?: { title?: string; description?: string; priority?: string },
  ) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, tenantId },
    })

    if (!ticket) {
      return { error: 'Ticket not found' }
    }

    const wo = await this.prisma.workOrder.create({
      data: {
        title: data?.title ?? ticket.title,
        description: data?.description ?? ticket.description,
        priority: data?.priority ?? ticket.priority ?? 'Média',
        status: 'Aberta',
        tenantId,
        assetId: ticket.assetId,
        ticketId: ticket.id,
      },
    })

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'Convertido' },
    })

    return wo
  }
}