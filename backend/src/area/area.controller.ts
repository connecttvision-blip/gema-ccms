import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AreaService } from './area.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/roles/roles.decorator'
import { Role } from '../auth/roles/roles.enum'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GESTOR)
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  create(@Req() req: any, @Body() body: { name: string; plantId: string }) {
    return this.areaService.create(req.user.tenantId, body)
  }

  @Get()
  findAll(@Req() req: any, @Query('plantId') plantId?: string) {
    return this.areaService.findAll(req.user.tenantId, plantId)
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: { name?: string }) {
    return this.areaService.update(req.user.tenantId, id, body)
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.areaService.remove(req.user.tenantId, id)
  }
}
