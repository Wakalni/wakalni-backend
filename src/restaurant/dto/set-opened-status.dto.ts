import { IsNotEmpty, IsBoolean } from 'class-validator'

export class SetOpenedStatus {
    @IsBoolean()
    @IsNotEmpty()
    status: boolean
}