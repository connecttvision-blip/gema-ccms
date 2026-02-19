import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Roles(Role.GESTOR)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.assetService.create(body, req.user.tenantId);
  }

  @Roles(Role.GESTOR)
  @Get()
  findAll(@Req() req: any) {
    return this.assetService.findAll(req.user.tenantId);
  }

  @Roles(Role.GESTOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.assetService.update(id, body, req.user.tenantId);
  }

  @Roles(Role.GESTOR)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.assetService.remove(id, req.user.tenantId);
  }
}