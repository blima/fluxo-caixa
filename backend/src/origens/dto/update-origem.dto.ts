import { PartialType } from '@nestjs/mapped-types';
import { CreateOrigemDto } from './create-origem.dto';

export class UpdateOrigemDto extends PartialType(CreateOrigemDto) {}
