import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TiposPagamentoService } from './tipos-pagamento.service';
import { CreateTipoPagamentoDto } from './dto/create-tipo-pagamento.dto';
import { UpdateTipoPagamentoDto } from './dto/update-tipo-pagamento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tipos-pagamento')
@UseGuards(JwtAuthGuard)
export class TiposPagamentoController {
  constructor(private readonly service: TiposPagamentoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTipoPagamentoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTipoPagamentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
