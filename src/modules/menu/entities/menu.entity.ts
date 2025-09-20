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
import { MenuItem } from './menu-item.entity'

@Entity('menus')
export class Menu {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 100, unique: true })
    url_code: string

    @Column({ type: 'uuid' })
    restaurant_id: string

    @Column({ type: 'boolean', default: true })
    is_active: boolean

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant

    @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, {
        cascade: true,
        eager: true, // Automatically load menu items with menu
    })
    items: MenuItem[]

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
