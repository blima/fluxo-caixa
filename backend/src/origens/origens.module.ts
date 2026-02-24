import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Origem } from './origem.entity';
import { OrigensService } from './origens.service';
import { OrigensController } from './origens.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Origem])],
  controllers: [OrigensController],
  providers: [OrigensService],
  exports: [OrigensService],
})
export class OrigensModule {}
