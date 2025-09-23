import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Restaurant } from './restaurant.entity'

@Entity('restaurant_opening_hours')
export class OpeningHours {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 10 })
    day_of_week: string

    @Column({ type: 'time' })
    open_time: string

    @Column({ type: 'time' })
    close_time: string

    @Column({ type: 'uuid' })
    restaurant_id: string

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.opening_hours, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant
}
