import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { OrderStatus, Invoice } from './entities/order.entity'
import { Restaurant } from '../restaurant/entities/restaurant.entity'
import { User } from '../user/entities/user.entity'
import { PaymentService } from '../payment/payment.service';
import { Inject } from '@nestjs/common'

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private restaurantRepository: Repository<Restaurant>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(PaymentService)
        private paymentService: PaymentService,

    ) {}

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { id: createOrderDto.restaurant_id },
        })

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found')
        }

        if (createOrderDto.user_id) {
            const user = await this.userRepository.findOne({
                where: { id: createOrderDto.user_id },
            })

            if (!user) {
                throw new NotFoundException('User not found')
            }
        }

        const invoice = this.calculateInvoice(createOrderDto.items)

        const order = this.orderRepository.create({
            restaurant_id: createOrderDto.restaurant_id,
            user_id: createOrderDto.user_id || null,
            payment_method: createOrderDto.payment_method,
            delivery_address: createOrderDto.delivery_address,
            invoice,
            status: OrderStatus.PENDING,
        })

        order.items = createOrderDto.items.map((item) =>
            this.orderItemRepository.create({
                menu_item_id: item.menu_item_id,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price,
                special_instructions: item.special_instructions,
            }),
        )

        return this.orderRepository.save(order)
    }

    async findAll(restaurantId?: string, userId?: string, status?: OrderStatus): Promise<Order[]> {
        const where: any = {}

        if (restaurantId) where.restaurant_id = restaurantId
        if (userId) where.user_id = userId
        if (status) where.status = status

        return this.orderRepository.find({
            where,
            relations: ['restaurant', 'user', 'items'],
            order: { created_at: 'DESC' },
        })
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['restaurant', 'user', 'items'],
        })

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`)
        }

        return order
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id)

        if (
            updateOrderDto.status &&
            !this.isValidStatusTransition(order.status, updateOrderDto.status)
        ) {
            throw new BadRequestException(
                `Invalid status transition from ${order.status} to ${updateOrderDto.status}`,
            )
        }

        Object.assign(order, updateOrderDto)
        return this.orderRepository.save(order)
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id)

        if (!this.isValidStatusTransition(order.status, status)) {
            throw new BadRequestException(
                `Invalid status transition from ${order.status} to ${status}`,
            )
        }

        order.status = status
        return this.orderRepository.save(order)
    }

    async cancelOrder(id: string): Promise<Order> {
        const order = await this.findOne(id)

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Only pending orders can be cancelled')
        }

        order.status = OrderStatus.CANCELLED
        return this.orderRepository.save(order)
    }

    async findByUser(userId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user_id: userId },
            relations: ['restaurant', 'items'],
            order: { created_at: 'DESC' },
        })
    }

    async findByRestaurant(restaurantId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { restaurant_id: restaurantId },
            relations: ['user', 'items'],
            order: { created_at: 'DESC' },
        })
    }

    private calculateInvoice(items: any[]): Invoice {
        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
        const delivery_fee = 500 
        const tax = Math.round(subtotal * 0.08)
        const total = subtotal + delivery_fee + tax

        return {
            subtotal,
            delivery_fee,
            tax,
            total,
            items: items.map((item) => ({
                menu_item_id: item.menu_item_id,
                name: item.name,
                quantity: item.quantity,
                price: item.unit_price,
                total: item.quantity * item.unit_price,
            })),
        }
    }

    private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
            [OrderStatus.PREPARING]: [OrderStatus.ON_DELIVERY, OrderStatus.CANCELLED],
            [OrderStatus.ON_DELIVERY]: [OrderStatus.COMPLETED],
            [OrderStatus.COMPLETED]: [],
            [OrderStatus.CANCELLED]: [],
        }

        return validTransitions[currentStatus].includes(newStatus)
    }

    async createOrderWithPayment(createOrderDto: CreateOrderDto) {
        const order = await this.create(createOrderDto);
    
        const paymentResult = await this.paymentService.initiatePayment(
          order.invoice.total,
          'guidini',
          'DZD',
          {
            order_id: order.id,
            customer_email: order.user?.email,
            language: 'fr',
          }
        );
    
        if (!paymentResult.success) {
          throw new Error(`Payment initiation failed: ${paymentResult.error}`);
        }
    
        order.payment_id = paymentResult.paymentId;
        order.payment_provider = 'guidini';
        order.payment_status = 'processing';
    
        return this.orderRepository.save(order);
      }
    
      async verifyOrderPayment(orderId: string) {
        const order = await this.findOne(orderId);
        
        if (!order.payment_id || !order.payment_provider) {
          throw new Error('Order does not have payment information');
        }
    
        const verificationResult = await this.paymentService.verifyPayment(
          order.payment_id,
          order.payment_provider
        );
    
        order.payment_status = verificationResult.status;
    
        if (verificationResult.success) {
          order.status = OrderStatus.PREPARING;
        }
    
        return this.orderRepository.save(order);
      }
}
