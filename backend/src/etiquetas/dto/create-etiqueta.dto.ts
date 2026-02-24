import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateEtiquetaDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um hex válido (#RRGGBB)' })
  cor?: string;

  @IsOptional()
  @IsBoolean()
  padrao?: boolean;
}
