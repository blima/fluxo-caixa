import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('destinos')
export class Destino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ default: false })
  padrao: boolean;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
