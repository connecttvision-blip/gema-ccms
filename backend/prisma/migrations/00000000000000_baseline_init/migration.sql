-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SituacaoMaterial" AS ENUM ('Completo', 'Parcial', 'Indisponivel');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('Aberta', 'Planejada', 'EmExecucao', 'Paralisada', 'AguardandoTerceiro', 'AguardandoJanela', 'FinalizadaExecucao', 'Encerrada', 'Cancelada');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Reservada', 'Parcial', 'Cancelada', 'Consumida');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('Retirada', 'Consumo', 'Devolucao');

-- CreateEnum
CREATE TYPE "PurchaseRequestType" AS ENUM ('RCU');

-- CreateEnum
CREATE TYPE "TipoPreventiva" AS ENUM ('Tempo', 'Horimetro');

-- CreateEnum
CREATE TYPE "MeterType" AS ENUM ('Horimetro');

-- CreateEnum
CREATE TYPE "MeterSource" AS ENUM ('Manual', 'Integracao');

-- CreateEnum
CREATE TYPE "PreventivePlanStatus" AS ENUM ('EmDia', 'Vencido', 'Atrasado');

-- CreateEnum
CREATE TYPE "DelayCause" AS ENUM ('Logistica', 'AguardandoPeca', 'Terceiro', 'JanelaOperacional', 'FaltaMaoDeObra', 'Engenharia', 'Outros');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "role" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "tag" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "areaId" UUID NOT NULL,
    "lineId" UUID NOT NULL,
    "plantId" UUID NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'Média',
    "assetId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" UUID,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'Aberta',
    "situacaoMaterial" "SituacaoMaterial" NOT NULL DEFAULT 'Completo',
    "motivoParalisacao" TEXT,
    "paralisadoEm" TIMESTAMP(3),
    "preventivePlanId" UUID,
    "delayCause" "DelayCause",
    "documentGeneratedAt" TIMESTAMP(3),
    "documentGeneratedBy" UUID,
    "documentHash" TEXT,
    "documentKey" TEXT,
    "documentUrl" TEXT,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "type" "PurchaseRequestType" NOT NULL DEFAULT 'RCU',
    "inventoryItemId" UUID NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aberta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "plantId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Line" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "areaId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aberto',
    "priority" TEXT NOT NULL DEFAULT 'Média',
    "assetId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderExecution" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workOrderId" UUID NOT NULL,
    "executorId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "totalMinutes" INTEGER,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryReservation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "requestedQty" INTEGER NOT NULL,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "status" "ReservationStatus" NOT NULL DEFAULT 'Reservada',
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventivePlan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tipo" "TipoPreventiva" NOT NULL,
    "intervaloDias" INTEGER,
    "intervaloHoras" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "proximaExecucao" TIMESTAMP(3),
    "ultimaExecucao" TIMESTAMP(3),
    "ultimaLeituraHoras" DOUBLE PRECISION,
    "statusPlano" "PreventivePlanStatus" NOT NULL DEFAULT 'EmDia',

    CONSTRAINT "PreventivePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "workOrderId" UUID,
    "reservationId" UUID,
    "type" "InventoryMovementType" NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMeterReading" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "meterType" "MeterType" NOT NULL DEFAULT 'Horimetro',
    "source" "MeterSource" NOT NULL DEFAULT 'Manual',
    "value" DOUBLE PRECISION NOT NULL,
    "readingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalRef" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetMeterReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderStatusHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workOrderId" UUID NOT NULL,
    "fromStatus" "WorkOrderStatus" NOT NULL,
    "toStatus" "WorkOrderStatus" NOT NULL,
    "changedById" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Asset_tenantId_idx" ON "Asset"("tenantId");

-- CreateIndex
CREATE INDEX "Asset_plantId_idx" ON "Asset"("plantId");

-- CreateIndex
CREATE INDEX "Asset_areaId_idx" ON "Asset"("areaId");

-- CreateIndex
CREATE INDEX "Asset_lineId_idx" ON "Asset"("lineId");

-- CreateIndex
CREATE INDEX "WorkOrder_tenantId_assetId_idx" ON "WorkOrder"("tenantId", "assetId");

-- CreateIndex
CREATE INDEX "InventoryItem_tenantId_idx" ON "InventoryItem"("tenantId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_tenantId_idx" ON "PurchaseRequest"("tenantId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_inventoryItemId_idx" ON "PurchaseRequest"("inventoryItemId");

-- CreateIndex
CREATE INDEX "Plant_tenantId_idx" ON "Plant"("tenantId");

-- CreateIndex
CREATE INDEX "Area_tenantId_idx" ON "Area"("tenantId");

-- CreateIndex
CREATE INDEX "Area_plantId_idx" ON "Area"("plantId");

-- CreateIndex
CREATE INDEX "Line_tenantId_idx" ON "Line"("tenantId");

-- CreateIndex
CREATE INDEX "Line_areaId_idx" ON "Line"("areaId");

-- CreateIndex
CREATE INDEX "Ticket_tenantId_idx" ON "Ticket"("tenantId");

-- CreateIndex
CREATE INDEX "Ticket_assetId_idx" ON "Ticket"("assetId");

-- CreateIndex
CREATE INDEX "WorkOrderExecution_tenantId_idx" ON "WorkOrderExecution"("tenantId");

-- CreateIndex
CREATE INDEX "WorkOrderExecution_workOrderId_idx" ON "WorkOrderExecution"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderExecution_executorId_idx" ON "WorkOrderExecution"("executorId");

-- CreateIndex
CREATE INDEX "WorkOrderExecution_tenantId_workOrderId_idx" ON "WorkOrderExecution"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "InventoryReservation_tenantId_idx" ON "InventoryReservation"("tenantId");

-- CreateIndex
CREATE INDEX "InventoryReservation_workOrderId_idx" ON "InventoryReservation"("workOrderId");

-- CreateIndex
CREATE INDEX "InventoryReservation_inventoryItemId_idx" ON "InventoryReservation"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryReservation_tenantId_workOrderId_idx" ON "InventoryReservation"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "PreventivePlan_tenantId_idx" ON "PreventivePlan"("tenantId");

-- CreateIndex
CREATE INDEX "PreventivePlan_assetId_idx" ON "PreventivePlan"("assetId");

-- CreateIndex
CREATE INDEX "PreventivePlan_tenantId_assetId_idx" ON "PreventivePlan"("tenantId", "assetId");

-- CreateIndex
CREATE INDEX "InventoryMovement_tenantId_idx" ON "InventoryMovement"("tenantId");

-- CreateIndex
CREATE INDEX "InventoryMovement_inventoryItemId_idx" ON "InventoryMovement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryMovement_workOrderId_idx" ON "InventoryMovement"("workOrderId");

-- CreateIndex
CREATE INDEX "InventoryMovement_reservationId_idx" ON "InventoryMovement"("reservationId");

-- CreateIndex
CREATE INDEX "AssetMeterReading_tenantId_idx" ON "AssetMeterReading"("tenantId");

-- CreateIndex
CREATE INDEX "AssetMeterReading_assetId_idx" ON "AssetMeterReading"("assetId");

-- CreateIndex
CREATE INDEX "AssetMeterReading_tenantId_assetId_idx" ON "AssetMeterReading"("tenantId", "assetId");

-- CreateIndex
CREATE INDEX "AssetMeterReading_meterType_idx" ON "AssetMeterReading"("meterType");

-- CreateIndex
CREATE INDEX "AssetMeterReading_readingAt_idx" ON "AssetMeterReading"("readingAt");

-- CreateIndex
CREATE INDEX "WorkOrderStatusHistory_tenantId_idx" ON "WorkOrderStatusHistory"("tenantId");

-- CreateIndex
CREATE INDEX "WorkOrderStatusHistory_workOrderId_idx" ON "WorkOrderStatusHistory"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderStatusHistory_tenantId_workOrderId_idx" ON "WorkOrderStatusHistory"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderStatusHistory_changedById_idx" ON "WorkOrderStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "WorkOrderStatusHistory_createdAt_idx" ON "WorkOrderStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_preventivePlanId_fkey" FOREIGN KEY ("preventivePlanId") REFERENCES "PreventivePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Line" ADD CONSTRAINT "Line_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Line" ADD CONSTRAINT "Line_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderExecution" ADD CONSTRAINT "WorkOrderExecution_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderExecution" ADD CONSTRAINT "WorkOrderExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderExecution" ADD CONSTRAINT "WorkOrderExecution_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventivePlan" ADD CONSTRAINT "PreventivePlan_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventivePlan" ADD CONSTRAINT "PreventivePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "InventoryReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMeterReading" ADD CONSTRAINT "AssetMeterReading_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMeterReading" ADD CONSTRAINT "AssetMeterReading_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

