import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm'
import { UserRole } from '../enums/user-role.enum'
import { Order } from '../../order/entities/order.entity'
import { StockAdjustment } from '../../stock/entities/stock-adjustement.entity'
import { RestaurantOwnership } from 'src/modules/restaurant/entities/restaurant-ownership.entity'

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', unique: true, nullable: true })
    email: string | null

    @Column({ type: 'varchar', nullable: true })
    password: string | null

    @Column({ type: 'varchar', nullable: true })
    phone: string | null

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'varchar' })
    lastName: string

    @Column({ type: 'boolean', default: false })
    _banned: boolean

    @Column({ type: 'boolean', default: false })
    _deleted: boolean

    @Column({ type: 'boolean', default: false })
    _verified: boolean

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole

    @OneToMany(() => RestaurantOwnership, (employee) => employee.user)
    ownerships: RestaurantOwnership[];

    @OneToMany(() => Order, (order) => order.user_id)
    orders: Order[]

    @OneToMany(() => StockAdjustment, (adjustment) => adjustment.user)
    stock_adjustments: StockAdjustment[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
