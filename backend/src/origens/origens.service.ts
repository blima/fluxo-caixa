import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Origem } from './origem.entity';
import { CreateOrigemDto } from './dto/create-origem.dto';
import { UpdateOrigemDto } from './dto/update-origem.dto';

@Injectable()
export class OrigensService {
  constructor(
    @InjectRepository(Origem)
    private readonly repo: Repository<Origem>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id, ativo: true } });
    if (!item) throw new NotFoundException('Origem não encontrada');
    return item;
  }

  async findPadrao() {
    return this.repo.findOne({ where: { padrao: true, ativo: true } });
  }

  async create(dto: CreateOrigemDto) {
    if (dto.padrao) {
      await this.repo.update({ padrao: true, ativo: true }, { padrao: false });
    }
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateOrigemDto) {
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
