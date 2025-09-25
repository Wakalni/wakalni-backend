import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Restaurant } from './restaurant.entity';

export enum OwnershipRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity('restaurant_ownerships')
export class RestaurantOwnership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({
    type: 'enum',
    enum: OwnershipRole,
    default: OwnershipRole.EMPLOYEE,
  })
  role: OwnershipRole;

  @CreateDateColumn({ type: 'timestamp' })
  joined_at: Date;

  @ManyToOne(() => User, (user) => user.ownerships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.ownerships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
