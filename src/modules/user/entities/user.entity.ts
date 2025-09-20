import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm'
import { UserRole } from '../enums/user-role.enum'
import { Restaurant } from '../../restaurant/entities/restaurant.entity'
import { Order } from '../../order/entities/order.entity'
import { StockAdjustment } from '../../stock/entities/stock-adjustement.entity'

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', unique: true, nullable: true })
    email: string | null

    @Column({ type: 'varchar', nullable: true })
    phone: string | null

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'varchar', nullable: true })
    password_hash: string | null

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole

    @Column({ type: 'uuid', nullable: true })
    restaurant_id: string | null

    @OneToOne('Restaurant', 'admin', { lazy: true })
    restaurant: Promise<Restaurant>

    @OneToMany(() => Order, (order) => order.user_id)
    orders: Order[]

    @OneToMany(() => StockAdjustment, (adjustment) => adjustment.user)
    stock_adjustments: StockAdjustment[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
