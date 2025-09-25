import { PartialType } from '@nestjs/mapped-types';
import { CreatePayementDto } from './create-payement.dto';

export class UpdatePayementDto extends PartialType(CreatePayementDto) {}
