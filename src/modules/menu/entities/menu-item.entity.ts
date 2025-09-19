import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Menu } from './menu.entity';
  
  export interface Recipe {
    ingredients: Array<{
      ingredient_id: string;
      quantity: number;
      unit: string;
    }>;
    instructions: string[];
    preparation_time?: number;
    cooking_time?: number;
    servings?: number;
  }
  
  @Entity('menu_items')
  export class MenuItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    menu_id: string;
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'simple-array', nullable: true })
    pics: string[];
  
    @Column({ type: 'integer' })
    price: number;
  
    @Column({ type: 'boolean', default: true })
    available: boolean;
  
    @Column({ type: 'jsonb', default: { ingredients: [], instructions: [] } })
    recipe: Recipe;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string;
  
    @ManyToOne(() => Menu, (menu) => menu.items, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'menu_id' })
    menu: Menu;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  }