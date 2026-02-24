import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lancamento } from '../lancamentos/lancamento.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lancamento])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
