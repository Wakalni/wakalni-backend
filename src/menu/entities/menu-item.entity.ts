import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm'
import { Menu } from './menu.entity'
import { Recipe } from './recipe.entity'

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid' })
    menu_id: string

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'simple-array', nullable: true })
    pics: string[]

    @Column({ type: 'integer' })
    price: number

    @Column({ type: 'boolean', default: true })
    available: boolean

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string

    @ManyToOne(() => Menu, (menu) => menu.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'menu_id' })
    menu: Menu

    @OneToOne(() => Recipe, (recipe) => recipe.menu_item, {
        cascade: true,
        eager: true,
    })
    recipe: Recipe

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
