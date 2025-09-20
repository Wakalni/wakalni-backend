import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Order } from './order.entity'

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    order_id: string

    @Column({ type: 'uuid' })
    menu_item_id: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'integer' })
    quantity: number

    @Column({ type: 'integer' })
    unit_price: number

    @Column({ type: 'integer' })
    total_price: number

    @Column({ type: 'text', nullable: true })
    special_instructions: string

    @ManyToOne(() => Order, (order) => order.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'order_id' })
    order: Order
}
