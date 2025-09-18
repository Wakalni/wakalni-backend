import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm'
import { UserRole } from '../enums/user-role.enum'

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', unique: true, nullable: true })
    @Index()
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

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date

    constructor(partial: Partial<User>) {
        Object.assign(this, partial)
    }
}
