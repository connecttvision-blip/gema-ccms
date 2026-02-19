import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWithdrawDto {
  @IsUUID()
  inventoryItemId: string;

  @IsOptional()
  @IsUUID()
  workOrderId?: string;

  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @IsNumber()
  @Min(0.000001)
  qty: number;

  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}