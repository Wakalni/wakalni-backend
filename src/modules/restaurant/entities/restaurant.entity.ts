import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { User } from '../../user/entities/user.entity';
  import { OpeningHours } from './opening-hours.entity';
  import { Ingredient } from 'src/modules/ingredient/entities/ingredient.entity';
  
  @Entity('restaurants')
  export class Restaurant {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'varchar', length: 500 })
    address: string;
  
    @Column({ type: 'varchar', length: 100 })
    city: string;
  
    @Column({ type: 'varchar', length: 100 })
    country: string;
  
    @Column({ type: 'varchar', length: 50 })
    timezone: string;
  
    @Column({ type: 'varchar', length: 500, nullable: true })
    logo_url: string;
  
    @Column({ type: 'varchar', length: 500, nullable: true })
    cover_image: string;
  
    @Column({ type: 'uuid', unique: true })
    admin_id: string;
  
    @OneToOne(() => User, (user) => user.restaurant)
    @JoinColumn({ name: 'admin_id' })
    admin: User;
  
    @OneToMany(() => OpeningHours, (openingHours) => openingHours.restaurant, {
      cascade: true,
    })
    opening_hours: OpeningHours[];

    @OneToMany(() => Ingredient, (ingredient) => ingredient.restaurant)
    ingredients: Ingredient[];
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  }
