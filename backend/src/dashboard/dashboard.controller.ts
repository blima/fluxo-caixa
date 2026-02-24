import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('resumo')
  resumo(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.resumo(de, ate);
  }

  @Get('receita-despesa')
  receitaDespesa(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.receitaDespesaMensal(de, ate);
  }

  @Get('por-etiqueta')
  porEtiqueta(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.porEtiqueta(de, ate);
  }

  @Get('por-origem')
  porOrigem(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.porOrigem(de, ate);
  }

  @Get('por-destino')
  porDestino(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.porDestino(de, ate);
  }

  @Get('por-tipo-pagamento')
  porTipoPagamento(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.porTipoPagamento(de, ate);
  }

  @Get('saldo')
  saldo(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.service.saldoDiario(de, ate);
  }
}
