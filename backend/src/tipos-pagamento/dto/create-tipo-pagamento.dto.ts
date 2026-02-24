import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTipoPagamentoDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(['a_vista', 'a_prazo'], {
    message: 'Modalidade deve ser a_vista ou a_prazo',
  })
  modalidade: 'a_vista' | 'a_prazo';

  @IsInt({ message: 'Parcelas deve ser um número inteiro' })
  @Min(1, { message: 'Parcelas deve ser no mínimo 1' })
  parcelas: number;
}
