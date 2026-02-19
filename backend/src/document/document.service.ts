import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import puppeteer from "puppeteer";
import { renderWorkOrderHtml } from "./document.template";
import { S3Service } from "./s3.service";

@Injectable()
export class DocumentService {
  constructor(private readonly s3Service: S3Service) {}

  async generateWorkOrderPdfBuffer(input: {
    tenantName: string;
    tenantId: string;
    workOrderId: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    assetName: string;
    createdAt: string;
    closedAt?: string | null;
  }): Promise<{ pdfBuffer: Buffer; sha256: string; documentKey: string }> {
    const html = renderWorkOrderHtml({ ...input, documentHash: null });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = Buffer.from(
        await page.pdf({
          format: "A4",
          printBackground: true,
          margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
        })
      );

      const sha256 = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

      const documentKey = `${input.tenantId}/${input.workOrderId}/os-${input.workOrderId}.pdf`;
      
      console.log("[DOC] uploading to S3 key=", documentKey);
      
      await this.s3Service.uploadPdf(documentKey, pdfBuffer);

      console.log("[DOC] uploaded OK");
      
      return { pdfBuffer, sha256, documentKey };
    } finally {
      await browser.close();
    }
  }
}