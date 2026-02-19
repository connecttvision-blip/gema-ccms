import { PurchaseRequestService } from '../purchase-request/purchase-request.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { CreateConsumeDto } from './dto/create-consume.dto';

@Injectable()
export class InventoryMovementService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly purchaseRequestService: PurchaseRequestService,
) {}

  async withdraw(tenantId: string, dto: CreateWithdrawDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id: dto.inventoryItemId, tenantId },
      });

      if (!item) {
        throw new NotFoundException('InventoryItem not found');
      }

      const available = item.quantity ?? 0;

      if (available <= 0) {
        // Sem estoque: gera RCU (se tiver OS vinculada) e retorna parcial 0
        if (dto.workOrderId) {
          await tx.workOrder.update({
            where: { id: dto.workOrderId },
            data: { situacaoMaterial: 'Parcial' },
          });
          // fora do tx do prisma client gerado? aqui usamos o próprio service após
        }

        return {
          movement: null,
          inventoryItem: item,
          requestedQty: dto.qty,
          withdrawnQty: 0,
          missingQty: dto.qty,
          status: 'Parcial',
        };
      }

      const withdrawnQty = Math.min(dto.qty, available);
      const missingQty = dto.qty - withdrawnQty;

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantity: available - withdrawnQty,
        },
      });

      const movement =
        withdrawnQty > 0
          ? await tx.inventoryMovement.create({
              data: {
                tenantId,
                inventoryItemId: dto.inventoryItemId,
                workOrderId: dto.workOrderId ?? null,
                reservationId: dto.reservationId ?? null,
                type: 'Retirada',
                qty: withdrawnQty,
                createdByUserId: dto.createdByUserId ?? null,
              },
            })
          : null;

      if (missingQty > 0 && dto.workOrderId) {
        await tx.workOrder.update({
          where: { id: dto.workOrderId },
          data: { situacaoMaterial: 'Parcial' },
        });
      }

      return {
        movement,
        inventoryItem: updated,
        requestedQty: dto.qty,
        withdrawnQty,
        missingQty,
        status: missingQty > 0 ? 'Parcial' : 'Reservada',
      };
    }).then(async (result) => {
      // Geração/atualização da RCU fora do transaction do tx
      // (para evitar dependência circular de tx vs service)
      if (result.missingQty > 0) {
        await this.purchaseRequestService.upsertRCUForItem(
  tenantId,
  dto.inventoryItemId,
  result.missingQty,
  `Falta identificada na retirada (workOrderId=${dto.workOrderId ?? 'N/A'})`,
);
      }
      return result;
    });
  }

  async consume(tenantId: string, dto: CreateConsumeDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id: dto.inventoryItemId, tenantId },
      });
      if (!item) throw new NotFoundException('InventoryItem not found');

      const withdrawals = await tx.inventoryMovement.aggregate({
        where: {
          tenantId,
          inventoryItemId: dto.inventoryItemId,
          workOrderId: dto.workOrderId,
          type: 'Retirada',
        },
        _sum: { qty: true },
      });

      const consumes = await tx.inventoryMovement.aggregate({
        where: {
          tenantId,
          inventoryItemId: dto.inventoryItemId,
          workOrderId: dto.workOrderId,
          type: 'Consumo',
        },
        _sum: { qty: true },
      });

      const withdrawnQty = withdrawals._sum.qty ?? 0;
      const consumedQty = consumes._sum.qty ?? 0;

      if (withdrawnQty <= 0) {
        throw new BadRequestException('No withdrawals found for this work order');
      }

      if (consumedQty + dto.qty > withdrawnQty) {
        throw new BadRequestException('Consume qty exceeds withdrawn qty for this work order');
      }

      const consumption = await tx.inventoryMovement.create({
        data: {
          tenantId,
          inventoryItemId: dto.inventoryItemId,
          workOrderId: dto.workOrderId,
          reservationId: dto.reservationId ?? null,
          type: 'Consumo',
          qty: dto.qty,
          createdByUserId: dto.createdByUserId ?? null,
        },
      });

      const totalConsumedAfter = consumedQty + dto.qty;
      const remainingToReturn = withdrawnQty - totalConsumedAfter;

      return {
        consumption,
        withdrawnQty,
        totalConsumedAfter,
        remainingToReturn,
      };
    });
  }
}