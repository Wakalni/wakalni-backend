import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Check if email already exists
        if (createUserDto.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: createUserDto.email },
            })
            if (existingUser) {
                throw new ConflictException('Email already exists')
            }
        }

        // Hash password if provided
        let passwordHash = null
        if (createUserDto.password) {
            passwordHash = await bcrypt.hash(createUserDto.password, 10)
        }

        const user = this.usersRepository.create({
            ...createUserDto,
            password_hash: passwordHash,
        })

        return this.usersRepository.save(user)
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find()
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } })
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        return user
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } })
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { phone } })
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id)

        // Hash new password if provided
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
        }

        Object.assign(user, updateUserDto)
        return this.usersRepository.save(user)
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id)
        await this.usersRepository.remove(user)
    }

    async validateUser(identifier: string, password: string): Promise<User | null> {
        let user: User | null = null

        // Try to find by email or phone
        if (identifier.includes('@')) {
            user = await this.findByEmail(identifier)
        } else {
            user = await this.findByPhone(identifier)
        }

        if (user && user.password_hash && (await bcrypt.compare(password, user.password_hash))) {
            return user
        }

        return null
    }
}
