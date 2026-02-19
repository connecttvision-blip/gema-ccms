import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryItemService {
  constructor(private prisma: PrismaService) {}

  async reserveItem(body: any, req: any) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      return { error: 'x-tenant-id header required' };
    }

    const { workOrderId, inventoryItemId, quantity } = body;

    if (!workOrderId || !inventoryItemId || !quantity) {
      return { error: 'Missing required fields' };
    }

    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, tenantId },
    });

    if (!item) {
      return { error: 'Inventory item not found' };
    }

    const existingReservations = await this.prisma.inventoryReservation.findMany({
      where: {
        inventoryItemId,
        tenantId,
        status: { in: ['Reservada', 'Parcial'] },
      },
    });

    const totalReserved = existingReservations.reduce(
      (acc, r) => acc + r.reservedQty,
      0,
    );

    const available = item.quantity - totalReserved;

    let reservedQty = 0;
    let status: 'Reservada' | 'Parcial' = 'Reservada';

    if (available <= 0) {
      return { error: 'No stock available for reservation' };
    }

    if (available < quantity) {
      reservedQty = available;
      status = 'Parcial';
    } else {
      reservedQty = quantity;
      status = 'Reservada';
    }

    const reservation = await this.prisma.inventoryReservation.create({
      data: {
        tenantId,
        workOrderId,
        inventoryItemId,
        requestedQty: quantity,
        reservedQty,
        status: status as any,
      },
    });

    return {
      message:
        status === 'Parcial'
          ? 'Partial reservation created'
          : 'Reservation created successfully',
      reservation,
    };
  }
}