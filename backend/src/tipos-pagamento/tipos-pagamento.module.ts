import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoPagamento } from './tipo-pagamento.entity';
import { TiposPagamentoService } from './tipos-pagamento.service';
import { TiposPagamentoController } from './tipos-pagamento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoPagamento])],
  controllers: [TiposPagamentoController],
  providers: [TiposPagamentoService],
  exports: [TiposPagamentoService],
})
export class TiposPagamentoModule {}
