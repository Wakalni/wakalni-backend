import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsOptional,
    IsUUID,
    Matches,
  } from 'class-validator';
  
  export class CreateMenuDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9-]+$/, {
      message: 'URL code can only contain lowercase letters, numbers, and hyphens',
    })
    url_code: string;
  
    @IsUUID()
    @IsNotEmpty()
    restaurant_id: string;
  
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
  }