import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateConsumeDto {
  @IsUUID()
  inventoryItemId: string;

  @IsUUID()
  workOrderId: string;

  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @IsNumber()
  @Min(0.000001)
  qty: number;

  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}