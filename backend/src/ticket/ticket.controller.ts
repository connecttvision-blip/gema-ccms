import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { TicketService } from './ticket.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/roles/roles.decorator'
import { Role } from '../auth/roles/roles.enum'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OPERADOR, Role.TECNICO, Role.PCM, Role.GESTOR)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { title: string; description?: string; priority?: string; assetId: string },
  ) {
    return this.ticketService.create(req.user.tenantId, body)
  }

  @Get()
  findAll(@Req() req: any, @Query('assetId') assetId?: string) {
    return this.ticketService.findAll(req.user.tenantId, assetId)
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; status?: string; priority?: string },
  ) {
    return this.ticketService.update(req.user.tenantId, id, body)
  }
@Post(':id/convert')
@Roles(Role.PCM, Role.GESTOR)
convert(
  @Req() req: any,
  @Param('id') id: string,
  @Body() body?: { title?: string; description?: string; priority?: string },
) {
  return this.ticketService.convertToWorkOrder(req.user.tenantId, id, body)
}

  @Delete(':id')
  @Roles(Role.GESTOR)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.ticketService.remove(req.user.tenantId, id)
  }
}