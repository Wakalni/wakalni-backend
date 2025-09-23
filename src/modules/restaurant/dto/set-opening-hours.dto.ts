import { IsString, IsNotEmpty } from 'class-validator'

export class SetOpeningHoursDto {
    @IsString()
    @IsNotEmpty()
    day_of_week: string

    @IsString()
    @IsNotEmpty()
    open_time: string

    @IsString()
    @IsNotEmpty()
    close_time: string
}