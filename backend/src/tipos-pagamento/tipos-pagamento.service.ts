import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPagamento } from './tipo-pagamento.entity';
import { CreateTipoPagamentoDto } from './dto/create-tipo-pagamento.dto';
import { UpdateTipoPagamentoDto } from './dto/update-tipo-pagamento.dto';

@Injectable()
export class TiposPagamentoService {
  constructor(
    @InjectRepository(TipoPagamento)
    private readonly repo: Repository<TipoPagamento>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id, ativo: true } });
    if (!item) throw new NotFoundException('Tipo de pagamento não encontrado');
    return item;
  }

  async create(dto: CreateTipoPagamentoDto) {
    this.validateModalidade(dto.modalidade, dto.parcelas);
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateTipoPagamentoDto) {
    const item = await this.findOne(id);
    const modalidade = dto.modalidade ?? item.modalidade;
    const parcelas = dto.parcelas ?? item.parcelas;
    this.validateModalidade(modalidade, parcelas);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    item.ativo = false;
    return this.repo.save(item);
  }

  private validateModalidade(
    modalidade: 'a_vista' | 'a_prazo',
    parcelas: number,
  ) {
    if (modalidade === 'a_vista' && parcelas !== 1) {
      throw new BadRequestException(
        'Pagamento à vista deve ter exatamente 1 parcela',
      );
    }
    if (modalidade === 'a_prazo' && parcelas <= 1) {
      throw new BadRequestException(
        'Pagamento a prazo deve ter mais de 1 parcela',
      );
    }
  }
}
