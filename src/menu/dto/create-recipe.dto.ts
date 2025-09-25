import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsNumber,
    Min,
    Max,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

class RecipeIngredientDto {
    @IsUUID()
    ingredient_id: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsNumber()
    @Min(0)
    quantity: number

    @IsString()
    @IsNotEmpty()
    unit: string

    @IsNumber()
    @Min(0)
    cost_per_unit: number
}

class RecipeStepDto {
    @IsNumber()
    @Min(1)
    step_number: number

    @IsString()
    @IsNotEmpty()
    instruction: string

    @IsNumber()
    @Min(0)
    @IsOptional()
    time_required?: number

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    equipment?: string[]
}

export class CreateRecipeDto {
    @IsUUID()
    @IsNotEmpty()
    menu_item_id: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    @IsOptional()
    main_ingredients?: RecipeIngredientDto[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeIngredientDto)
    @IsOptional()
    sub_ingredients?: RecipeIngredientDto[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipeStepDto)
    @IsOptional()
    steps?: RecipeStepDto[]

    @IsNumber()
    @Min(0)
    @IsOptional()
    preparation_time?: number

    @IsNumber()
    @Min(0)
    @IsOptional()
    cooking_time?: number

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    margin_percent?: number
}
