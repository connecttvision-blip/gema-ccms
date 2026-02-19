import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { PlantService } from './plant.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/roles/roles.decorator'
import { Role } from '../auth/roles/roles.enum'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GESTOR)
@Controller('plant')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post()
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.plantService.create(req.user.tenantId, body)
  }

  @Get()
  findAll(@Req() req: any) {
    return this.plantService.findAll(req.user.tenantId)
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: { name?: string }) {
    return this.plantService.update(req.user.tenantId, id, body)
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.plantService.remove(req.user.tenantId, id)
  }
}