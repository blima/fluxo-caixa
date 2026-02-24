import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateDestinoDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  padrao?: boolean;
}
