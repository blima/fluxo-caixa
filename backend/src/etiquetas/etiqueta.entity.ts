import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('etiquetas')
export class Etiqueta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ length: 7, default: '#3B82F6' })
  cor: string;

  @Column({ default: false })
  padrao: boolean;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
