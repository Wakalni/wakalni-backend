import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm'
import { Restaurant } from '../../restaurant/entities/restaurant.entity'
import { User } from '../../user/entities/user.entity'
import { OrderItem } from './order-item.entity'

export enum OrderStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    ON_DELIVERY = 'on-delivery',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    CARD = 'card',
    WALLET = 'wallet',
    CASH = 'cash',
}

export interface DeliveryAddress {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
    apartment?: string
    instructions?: string
}

export interface Invoice {
    subtotal: number
    delivery_fee: number
    tax: number
    discount?: number
    total: number
    items: Array<{
        menu_item_id: string
        name: string
        quantity: number
        price: number
        total: number
    }>
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    restaurant_id: string

    @Column({ type: 'uuid', nullable: true })
    user_id: string | null

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    payment_method: PaymentMethod

    @Column({ type: 'jsonb' })
    invoice: Invoice

    @Column({ type: 'jsonb' })
    delivery_address: DeliveryAddress

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant

    @ManyToOne(() => User, (user) => user.orders, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'user_id' })
    user: User | null

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
        cascade: true,
        eager: true,
    })
    items: OrderItem[]

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date

    get order_number(): string {
        return `ORD-${this.created_at.getFullYear()}${String(this.created_at.getMonth() + 1).padStart(2, '0')}${this.id.slice(0, 8).toUpperCase()}`
    }

    get estimated_delivery_time(): Date {
        const deliveryTime = new Date(this.created_at)
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 45)
        return deliveryTime
    }
}
