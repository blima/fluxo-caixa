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
import { OrigensService } from './origens.service';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('origens')
@UseGuards(JwtAuthGuard)
export class OrigensController {
  constructor(private readonly service: OrigensService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrigemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrigemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/set-padrao')
  setPadrao(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.setPadrao(id);
  }
}
