import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { DocumentService } from "./document.service";

@Controller("document")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get("test-pdf")
  async testPdf(@Res() res: Response) {
    const { pdfBuffer, sha256 } =
      await this.documentService.generateWorkOrderPdfBuffer({
        tenantName: "GEMA TESTE",
        tenantId: "a7695c36-56c6-459e-85fe-a97c1770bb0e",
        workOrderId: "OS-TESTE-001",
        title: "Teste de Geração de PDF",
        description: "Documento de validação da ETAPA 5.",
        status: "Encerrada",
        priority: "Alta",
        assetName: "Motor Principal Linha 1",
        createdAt: new Date().toLocaleString("pt-BR"),
        closedAt: new Date().toLocaleString("pt-BR"),
      });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=os-teste.pdf",
      "X-Document-Hash": sha256,
    });

    res.send(pdfBuffer);
  }
}