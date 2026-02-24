import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tipos_pagamento')
export class TipoPagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: ['a_vista', 'a_prazo'],
    default: 'a_vista',
  })
  modalidade: 'a_vista' | 'a_prazo';

  @Column({ type: 'int', default: 1 })
  parcelas: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
