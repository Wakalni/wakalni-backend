// src/modules/stock/dto/update-stock-item.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStockItemDto } from './create-stock.dto';

export class UpdateStockItemDto extends PartialType(CreateStockItemDto) {}