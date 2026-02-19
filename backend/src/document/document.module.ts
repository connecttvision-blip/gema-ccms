import { Module } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { S3Service } from "./s3.service";

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, S3Service],
  exports: [DocumentService, S3Service], 
})
export class DocumentModule {}