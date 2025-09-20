import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockItem } from './entities/stock.entity';
import { StockAdjustment } from './entities/stock-adjustement.entity'
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, StockAdjustment, Ingredient, Restaurant, User])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}