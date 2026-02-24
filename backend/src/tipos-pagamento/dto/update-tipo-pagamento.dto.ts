import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoPagamentoDto } from './create-tipo-pagamento.dto';

export class UpdateTipoPagamentoDto extends PartialType(CreateTipoPagamentoDto) {}
