import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm'
import { Restaurant } from '../../restaurant/entities/restaurant.entity'
import { StockItem } from '../../stock/entities/stock.entity'

export enum IngredientCategory {
    MEAT = 'meat',
    VEGETABLE = 'vegetable',
    FRUIT = 'fruit',
    GRAIN = 'grain',
    SPICE = 'spice',
    OIL = 'oil',
    DAIRY = 'dairy',
    SEAFOOD = 'seafood',
    OTHER = 'other',
}

export enum IngredientUnit {
    KILOGRAM = 'kg',
    LITER = 'l',
    MILLILITER = 'ml',
    PIECE = 'piece',
}

@Entity('ingredients')
export class Ingredient {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid', nullable: true })
    restaurant_id: string | null

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({
        type: 'enum',
        enum: IngredientCategory,
        default: IngredientCategory.OTHER,
    })
    category: IngredientCategory

    @Column({
        type: 'enum',
        enum: IngredientUnit,
        default: IngredientUnit.KILOGRAM,
    })
    unit: IngredientUnit

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unit_cost: number

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    loss_percent: number

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.ingredients, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant

    @OneToMany(() => StockItem, (stockItem) => stockItem.ingredient)
    stock_items: StockItem[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date

    get cost_with_loss(): number {
        return this.unit_cost * (1 + this.loss_percent / 100)
    }
}
