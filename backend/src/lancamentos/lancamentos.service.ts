import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Lancamento } from './lancamento.entity';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

@Injectable()
export class LancamentosService {
  constructor(
    @InjectRepository(Lancamento)
    private readonly repo: Repository<Lancamento>,
  ) {}

  async findAll(filters: {
    tipo?: 'receita' | 'despesa';
    de?: string;
    ate?: string;
    etiqueta_id?: string;
    origem_id?: string;
    destino_id?: string;
  }) {
    const where: FindOptionsWhere<Lancamento> = { ativo: true };

    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.etiqueta_id) where.etiqueta_id = filters.etiqueta_id;
    if (filters.origem_id) where.origem_id = filters.origem_id;
    if (filters.destino_id) where.destino_id = filters.destino_id;

    const qb = this.repo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.origem', 'origem')
      .leftJoinAndSelect('l.destino', 'destino')
      .leftJoinAndSelect('l.etiqueta', 'etiqueta')
      .leftJoinAndSelect('l.tipo_pagamento', 'tipo_pagamento')
      .where('l.ativo = :ativo', { ativo: true });

    if (filters.tipo) {
      qb.andWhere('l.tipo = :tipo', { tipo: filters.tipo });
    }
    if (filters.etiqueta_id) {
      qb.andWhere('l.etiqueta_id = :etiqueta_id', {
        etiqueta_id: filters.etiqueta_id,
      });
    }
    if (filters.origem_id) {
      qb.andWhere('l.origem_id = :origem_id', {
        origem_id: filters.origem_id,
      });
    }
    if (filters.destino_id) {
      qb.andWhere('l.destino_id = :destino_id', {
        destino_id: filters.destino_id,
      });
    }
    if (filters.de) {
      qb.andWhere('l.data_evento >= :de', { de: filters.de });
    }
    if (filters.ate) {
      qb.andWhere('l.data_evento <= :ate', { ate: filters.ate });
    }

    qb.orderBy('l.data_evento', 'DESC').addOrderBy('l.created_at', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id, ativo: true },
      relations: ['origem', 'destino', 'etiqueta', 'tipo_pagamento'],
    });
    if (!item) throw new NotFoundException('Lançamento não encontrado');
    return item;
  }

  async create(dto: CreateLancamentoDto, userId: string) {
    this.validateOrigemDestino(dto);
    const item = this.repo.create({ ...dto, usuario_id: userId });
    const saved = await this.repo.save(item);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateLancamentoDto) {
    const item = await this.findOne(id);
    const merged = { ...item, ...dto };
    this.validateOrigemDestino(merged);
    Object.assign(item, dto);
    await this.repo.save(item);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    item.ativo = false;
    return this.repo.save(item);
  }

  private validateOrigemDestino(data: {
    tipo: string;
    origem_id?: string;
    destino_id?: string;
  }) {
    if (data.tipo === 'receita' && !data.origem_id) {
      throw new BadRequestException(
        'Receita deve ter uma origem',
      );
    }
    if (data.tipo === 'despesa' && !data.destino_id) {
      throw new BadRequestException(
        'Despesa deve ter um destino',
      );
    }
  }
}
