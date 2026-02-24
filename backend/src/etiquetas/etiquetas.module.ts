import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etiqueta } from './etiqueta.entity';
import { EtiquetasService } from './etiquetas.service';
import { EtiquetasController } from './etiquetas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Etiqueta])],
  controllers: [EtiquetasController],
  providers: [EtiquetasService],
  exports: [EtiquetasService],
})
export class EtiquetasModule {}
