import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLancamentoDto {
  @IsEnum(['receita', 'despesa'], {
    message: 'Tipo deve ser receita ou despesa',
  })
  tipo: 'receita' | 'despesa';

  @IsString()
  @MinLength(2, { message: 'Descrição deve ter no mínimo 2 caracteres' })
  descricao: string;

  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor: number;

  @IsDateString({}, { message: 'Data do evento inválida' })
  data_evento: string;

  @IsOptional()
  @IsUUID('4', { message: 'Origem inválida' })
  origem_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Destino inválido' })
  destino_id?: string;

  @IsUUID('4', { message: 'Etiqueta inválida' })
  etiqueta_id: string;

  @IsUUID('4', { message: 'Tipo de pagamento inválido' })
  tipo_pagamento_id: string;
}
