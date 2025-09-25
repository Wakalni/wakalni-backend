import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { StockItem } from './stock.entity';
  import { User } from '../../user/entities/user.entity';
  
  export enum StockAdjustmentType {
    RESTOCK = 'restock',
    USAGE = 'usage',
    WASTE = 'waste',
    CORRECTION = 'correction',
    TRANSFER = 'transfer',
  }
  
  @Entity('stock_adjustments')
  export class StockAdjustment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    stock_item_id: string;
  
    @Column({ type: 'uuid', nullable: true })
    user_id: string | null;
  
    @Column({
      type: 'enum',
      enum: StockAdjustmentType,
    })
    adjustment_type: StockAdjustmentType;
  
    @Column({ type: 'decimal', precision: 12, scale: 4 })
    quantity_change: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 4 })
    new_quantity: number;
  
    @Column({ type: 'text', nullable: true })
    reason: string;
  
    @Column({ type: 'text', nullable: true })
    reference: string; // e.g., purchase order number, recipe ID
  
    @ManyToOne(() => StockItem, (stockItem) => stockItem.adjustments, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'stock_item_id' })
    stock_item: StockItem;
  
    @ManyToOne(() => User, (user) => user.stock_adjustments, {
      onDelete: 'SET NULL',
      nullable: true,
    })
    @JoinColumn({ name: 'user_id' })
    user: User | null;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    get formatted_quantity_change(): string {
      return this.quantity_change > 0 
        ? `+${this.quantity_change}` 
        : this.quantity_change.toString();
    }
  }