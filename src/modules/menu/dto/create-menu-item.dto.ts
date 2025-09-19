// src/modules/menu/dto/create-menu-item.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsNumber,
    IsBoolean,
    IsArray,
    ValidateNested,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class RecipeIngredientDto {
    @IsUUID()
    ingredient_id: string;
  
    @IsNumber()
    @Min(0)
    quantity: number;
  
    @IsString()
    unit: string;
  }
  
  class RecipeDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    ingredients: RecipeIngredientDto[];
  
    @IsArray()
    @IsString({ each: true })
    instructions: string[];
  
    @IsNumber()
    @Min(0)
    @IsOptional()
    preparation_time?: number;
  
    @IsNumber()
    @Min(0)
    @IsOptional()
    cooking_time?: number;
  
    @IsNumber()
    @Min(1)
    @IsOptional()
    servings?: number;
  }
  
  export class CreateMenuItemDto {
    @IsUUID()
    @IsNotEmpty()
    menu_id: string;
  
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    pics?: string[];
  
    @IsNumber()
    @Min(0)
    price: number;
  
    @IsBoolean()
    @IsOptional()
    available?: boolean;
  
    @IsOptional()
    recipe?: RecipeDto;
  
    @IsString()
    @IsOptional()
    category?: string;
  }