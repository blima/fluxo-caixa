import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etiqueta } from './etiqueta.entity';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';

@Injectable()
export class EtiquetasService {
  constructor(
    @InjectRepository(Etiqueta)
    private readonly repo: Repository<Etiqueta>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id, ativo: true } });
    if (!item) throw new NotFoundException('Etiqueta não encontrada');
    return item;
  }

  async findPadrao() {
    return this.repo.findOne({ where: { padrao: true, ativo: true } });
  }

  async create(dto: CreateEtiquetaDto) {
    if (dto.padrao) {
      await this.repo.update({ padrao: true, ativo: true }, { padrao: false });
    }
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateEtiquetaDto) {
    const item = await this.findOne(id);
    if (dto.padrao) {
      await this.repo.update({ padrao: true, ativo: true }, { padrao: false });
    }
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    item.ativo = false;
    return this.repo.save(item);
  }

  async setPadrao(id: string) {
    await this.findOne(id);
    await this.repo.update({ padrao: true, ativo: true }, { padrao: false });
    await this.repo.update(id, { padrao: true });
    return this.findOne(id);
  }
}
