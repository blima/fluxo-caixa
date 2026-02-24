import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destino } from './destino.entity';
import { DestinosService } from './destinos.service';
import { DestinosController } from './destinos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Destino])],
  controllers: [DestinosController],
  providers: [DestinosService],
  exports: [DestinosService],
})
export class DestinosModule {}
