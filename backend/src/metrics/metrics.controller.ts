import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly service: MetricsService) {}

  @Get('mttr/asset/:assetId')
  async mttrByAsset(
    @Param('assetId') assetId: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.service.mttrByAsset(assetId, from, to, req);
  }

  @Get('mttr/global')
  async mttrGlobal(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.service.mttrGlobal(from, to, req);
  }

  @Get('mtbf/asset/:assetId')
  async mtbfByAsset(
    @Param('assetId') assetId: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.service.mtbfByAsset(assetId, from, to, req);
  }

  @Get('mtbf/global')
  async mtbfGlobal(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.service.mtbfGlobal(from, to, req);
  }

   @Get('availability/asset/:assetId')
  async availabilityByAsset(
    @Param('assetId') assetId: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.service.availabilityByAsset(assetId, from, to, req);
  }

  @Get('delays/causes')
async delaysByCause(
  @Query('slaHours') slaHours: string | undefined,
  @Req() req: any,
) {
  return this.service.delaysByCause(slaHours, req);
}

@Get('delays/priorities')
async delaysByPriority(@Req() req: any) {
  return this.service.delaysByPriority(req);
}

@Get('backlog/status')
async backlogByStatus(@Req() req: any) {
  return this.service.backlogByStatus(req);
}

@Get('backlog/paralisadas/causa')
async paralisadasPorCausa(@Req() req: any) {
  return this.service.paralisadasPorCausa(req);
}

@Get('backlog/paralisadas/tempo-medio')
async tempoMedioParalisada(@Req() req: any) {
  return this.service.tempoMedioParalisada(req);
}

}