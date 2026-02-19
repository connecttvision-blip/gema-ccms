import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchaseRequestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Regra RCU:
   * qty = (minStock - estoqueProjetado) + demandaPendenteTotal
   * - estoqueProjetado: quantity - reservas ativas (Reservada/Parcial)
   * - demandaPendenteTotal: soma das faltas (requested - reserved) de reservas Parciais
   */
  async upsertRCUForItem(
  tenantId: string,
  inventoryItemId: string,
  extraDemandQty: number = 0,
  reason?: string,
) {
    // 1) Item
    const item = await this.prisma.inventoryItem.findFirst({
      where: { tenantId, id: inventoryItemId },
    });

    if (!item) return null;

    // 2) Reservas ativas (estoque comprometido)
    const activeReserved = await this.prisma.inventoryReservation.aggregate({
      where: {
        tenantId,
        inventoryItemId,
        status: { in: ['Reservada', 'Parcial'] },
      },
      _sum: { reservedQty: true },
    });

    const reservedActiveQty = activeReserved._sum.reservedQty ?? 0;
    const projectedStock = (item.quantity ?? 0) - reservedActiveQty;

    // 3) Demanda pendente (faltas de reservas parciais)
    const partials = await this.prisma.inventoryReservation.findMany({
      where: {
        tenantId,
        inventoryItemId,
        status: 'Parcial',
      },
      select: { requestedQty: true, reservedQty: true },
    });

    const pendingDemand = partials.reduce((acc, r) => {
      const missing = (r.requestedQty ?? 0) - (r.reservedQty ?? 0);
      return acc + (missing > 0 ? missing : 0);
    }, 0);

    // 4) reposição até mínimo
    const minStock = item.minStock ?? 0;
    const replenishToMin = minStock > projectedStock ? (minStock - projectedStock) : 0;

    const extra = extraDemandQty > 0 ? extraDemandQty : 0;
    const qty = replenishToMin + pendingDemand + extra;
if (qty <= 0) return null;

    // 5) Upsert 1 RCU aberta por item
    const existing = await this.prisma.purchaseRequest.findFirst({
      where: {
        tenantId,
        inventoryItemId,
        type: 'RCU',
        status: 'Aberta',
      },
    });

    if (existing) {
      return this.prisma.purchaseRequest.update({
        where: { id: existing.id },
        data: { qty, reason: reason ?? existing.reason ?? null },
      });
    }

    return this.prisma.purchaseRequest.create({
      data: {
        tenantId,
        type: 'RCU',
        inventoryItemId,
        qty,
        reason: reason ?? null,
        status: 'Aberta',
      },
    });
  }
}