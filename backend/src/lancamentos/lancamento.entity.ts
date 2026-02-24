import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Origem } from '../origens/origem.entity';
import { Destino } from '../destinos/destino.entity';
import { Etiqueta } from '../etiquetas/etiqueta.entity';
import { TipoPagamento } from '../tipos-pagamento/tipo-pagamento.entity';
import { User } from '../users/user.entity';

@Entity('lancamentos')
export class Lancamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['receita', 'despesa'] })
  tipo: 'receita' | 'despesa';

  @Column({ length: 255 })
  descricao: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  data_lancamento: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  data_evento: string;

  @Column({ nullable: true })
  origem_id: string;

  @Column({ nullable: true })
  destino_id: string;

  @Column()
  etiqueta_id: string;

  @Column()
  tipo_pagamento_id: string;

  @Column()
  usuario_id: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Origem, { nullable: true })
  @JoinColumn({ name: 'origem_id' })
  origem: Origem;

  @ManyToOne(() => Destino, { nullable: true })
  @JoinColumn({ name: 'destino_id' })
  destino: Destino;

  @ManyToOne(() => Etiqueta)
  @JoinColumn({ name: 'etiqueta_id' })
  etiqueta: Etiqueta;

  @ManyToOne(() => TipoPagamento)
  @JoinColumn({ name: 'tipo_pagamento_id' })
  tipo_pagamento: TipoPagamento;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}
