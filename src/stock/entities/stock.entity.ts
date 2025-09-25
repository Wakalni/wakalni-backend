import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { Ingredient } from '../../ingredient/entities/ingredient.entity';
  import { Restaurant } from '../../restaurant/entities/restaurant.entity';
  import { StockAdjustment } from './stock-adjustement.entity';
  
  @Entity('stock_items')
  export class StockItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    ingredient_id: string;
  
    @Column({ type: 'uuid' })
    restaurant_id: string;
  
    @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
    quantity_in_base_unit: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
    low_threshold: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
    average_daily_usage: number;
  
    @Column({ type: 'timestamp', nullable: true })
    last_restocked_at: Date | null;
  
    @ManyToOne(() => Ingredient, (ingredient) => ingredient.stock_items, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'ingredient_id' })
    ingredient: Ingredient;
  
    @ManyToOne(() => Restaurant, (restaurant) => restaurant.stock_items, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;


    @OneToMany(() => StockAdjustment, (adjustment) => adjustment.stock_item, {
        cascade: true,
    })
    adjustments: StockAdjustment[];

  
    get is_low(): boolean {
      return this.quantity_in_base_unit <= this.low_threshold;
    }
  
    get estimated_days_remaining(): number | null {
      if (this.average_daily_usage <= 0) return null;
      return this.quantity_in_base_unit / this.average_daily_usage;
    }
  
    get suggested_restock_quantity(): number {
      const safetyStock = this.average_daily_usage * 7;
      return Math.max(0, safetyStock - this.quantity_in_base_unit);
    }
  }