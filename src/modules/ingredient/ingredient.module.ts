import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IngredientsService } from './ingredient.service'
import { IngredientsController } from './ingredient.controller'
import { Ingredient } from './entities/ingredient.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Ingredient])],
    controllers: [IngredientsController],
    providers: [IngredientsService],
    exports: [IngredientsService],
})
export class IngredientsModule {}
