import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { LineService } from './line.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/roles/roles.decorator'
import { Role } from '../auth/roles/roles.enum'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GESTOR)
@Controller('line')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @Post()
  create(@Req() req: any, @Body() body: { name: string; areaId: string }) {
    return this.lineService.create(req.user.tenantId, body)
  }

  @Get()
  findAll(@Req() req: any, @Query('areaId') areaId?: string) {
    return this.lineService.findAll(req.user.tenantId, areaId)
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: { name?: string }) {
    return this.lineService.update(req.user.tenantId, id, body)
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.lineService.remove(req.user.tenantId, id)
  }
}