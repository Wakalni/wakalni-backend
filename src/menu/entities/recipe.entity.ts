import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { MenuItem } from './menu-item.entity'

export interface RecipeIngredient {
    ingredient_id: string
    name: string
    quantity: number
    unit: string
    cost_per_unit: number
}

export interface RecipeStep {
    step_number: number
    instruction: string
    time_required?: number
    equipment?: string[]
}

@Entity('recipes')
export class Recipe {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid', unique: true })
    menu_item_id: string

    @Column({ type: 'jsonb', default: [] })
    main_ingredients: RecipeIngredient[]

    @Column({ type: 'jsonb', default: [] })
    sub_ingredients: RecipeIngredient[]

    @Column({ type: 'jsonb', default: [] })
    steps: RecipeStep[]

    @Column({ type: 'integer', default: 0 })
    total_cost_cents: number

    @Column({ type: 'integer', nullable: true })
    preparation_time: number

    @Column({ type: 'integer', nullable: true })
    cooking_time: number

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    margin_percent: number

    @OneToOne(() => MenuItem, (menuItem) => menuItem.recipe, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'menu_item_id' })
    menu_item: MenuItem

    get suggested_price(): number {
        const cost = this.total_cost_cents / 100
        return cost * (1 + this.margin_percent / 100)
    }
}
