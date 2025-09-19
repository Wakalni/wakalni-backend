import { IsString, IsEnum, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { IngredientCategory, IngredientUnit } from '../entities/ingredient.entity';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsEnum(IngredientCategory)
  category: IngredientCategory;

  @IsEnum(IngredientUnit)
  unit: IngredientUnit;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unit_cost: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  loss_percent?: number;

  @IsOptional()
  @IsUUID()
  restaurant_id?: string | null;
}

