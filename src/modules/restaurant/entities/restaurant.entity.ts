import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm'
import { OpeningHours } from './opening-hours.entity'
import { Ingredient } from 'src/modules/ingredient/entities/ingredient.entity'
import { Menu } from '../../menu/entities/menu.entity'
import { Order } from '../../order/entities/order.entity'
import { StockItem } from 'src/modules/stock/entities/stock.entity'
import { RestaurantOwnership } from './restaurant-ownership.entity'

@Entity('restaurants')
export class Restaurant {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'varchar', length: 500 })
    address: string

    @Column({ type: 'varchar', length: 100 })
    city: string

    @Column({ type: 'varchar', length: 500, nullable: true })
    logo_url: string

    @Column({ type: 'varchar', length: 500, nullable: true })
    cover_image: string

    @OneToMany(() => Menu, (menu) => menu.restaurant)
    menus: Menu[]

    @OneToMany(() => RestaurantOwnership, (employee) => employee.restaurant)
    ownerships: RestaurantOwnership[];

    @OneToMany(() => OpeningHours, (openingHours) => openingHours.restaurant, {
        cascade: true,
    })
    opening_hours?: OpeningHours[]

    @OneToMany(() => Ingredient, (ingredient) => ingredient.restaurant)
    ingredients: Ingredient[]

    @OneToMany(() => Order, (order) => order.restaurant)
    orders: Order[]

    @OneToMany(() => StockItem, (stockItem) => stockItem.restaurant)
    stock_items: StockItem[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
