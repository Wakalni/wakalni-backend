import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const userExist = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        })
        if (userExist) throw new BadRequestException('An error occurred');
        const passwordHashed = await bcrypt.hash(createUserDto.password, 10)
        const user = this.usersRepository.create({
            ...createUserDto,
            password: passwordHashed,
        })
        return this.usersRepository.save(user)
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find()
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } })
        if (!user) throw new NotFoundException(`User not found`)
        return user
    }


    async findByPhone(phone: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { phone } })
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id)
        Object.assign(user, updateUserDto)
        return this.usersRepository.save(user)
    }

    async updatePassword(id: string, updateUserpasswordDto: UpdateUserPasswordDto): Promise<User> {
        const user = await this.findOne(id)
        updateUserpasswordDto.oldPassword = await bcrypt.hash(updateUserpasswordDto.oldPassword, 10)
        if (user.password !== updateUserpasswordDto.oldPassword) throw new BadRequestException('An Error Occurred')
        updateUserpasswordDto.newPassword = await bcrypt.hash(updateUserpasswordDto.newPassword, 10)
        Object.assign(user, updateUserpasswordDto)
        return this.usersRepository.save(user)
    }

    async remove(id: string): Promise<void> {
        const result = await this.usersRepository.update(id, {_deleted: true})
        if (result.affected === 0) throw new BadRequestException(`Erroor occurred`)
    }

    async find(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } })
    }
}
