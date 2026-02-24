import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LancamentosService } from './lancamentos.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('lancamentos')
@UseGuards(JwtAuthGuard)
export class LancamentosController {
  constructor(private readonly service: LancamentosService) {}

  @Get()
  findAll(
    @Query('tipo') tipo?: 'receita' | 'despesa',
    @Query('de') de?: string,
    @Query('ate') ate?: string,
    @Query('etiqueta_id') etiqueta_id?: string,
    @Query('origem_id') origem_id?: string,
    @Query('destino_id') destino_id?: string,
  ) {
    return this.service.findAll({
      tipo,
      de,
      ate,
      etiqueta_id,
      origem_id,
      destino_id,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateLancamentoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLancamentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
