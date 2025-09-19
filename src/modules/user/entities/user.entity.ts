import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from 'typeorm'
import { UserRole } from '../enums/user-role.enum'
import { Restaurant } from '../../restaurant/entities/restaurant.entity'

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', unique: true, nullable: true })
    email: string | null

    @Column({ type: 'varchar', nullable: true })
    phone: string | null

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'varchar', nullable: true })
    password_hash: string | null

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole

    @Column({ type: 'uuid', nullable: true })
    restaurant_id: string | null

    @OneToOne('Restaurant', 'admin', { lazy: true })
    restaurant: Promise<Restaurant>

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
