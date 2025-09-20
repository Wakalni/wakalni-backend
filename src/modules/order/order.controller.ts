import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common'
import { OrderService } from './order.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'
import { OrderStatus } from './entities/order.entity'
import { NotFoundException } from '@nestjs/common'

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.SUPERADMIN)
    create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        if (req.user && req.user.role !== UserRole.SUPERADMIN) {
            createOrderDto.user_id = req.user.userId
        }
        return this.orderService.create(createOrderDto)
    }

    @Get()
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    findAll(
        @Query('restaurantId') restaurantId?: string,
        @Query('userId') userId?: string,
        @Query('status') status?: OrderStatus,
    ) {
        return this.orderService.findAll(restaurantId, userId, status)
    }

    @Get('my-orders')
    @Roles(UserRole.CLIENT)
    findMyOrders(@Request() req) {
        return this.orderService.findByUser(req.user.userId)
    }

    @Get('restaurant-orders')
    @Roles(UserRole.ADMIN)
    findRestaurantOrders(@Request() req) {
        return this.orderService.findByRestaurant(req.user.restaurant_id)
    }

    @Get(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    async findOne(@Param('id') id: string, @Request() req) {
        const order = await this.orderService.findOne(id)

        if (req.user.role === UserRole.CLIENT && order.user_id !== req.user.userId) {
            throw new NotFoundException('Order not found')
        }

        if (req.user.role === UserRole.ADMIN && order.restaurant_id !== req.user.restaurant_id) {
            throw new NotFoundException('Order not found')
        }

        return order
    }

    @Patch(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.update(id, updateOrderDto)
    }

    @Patch(':id/status/:status')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    updateStatus(@Param('id') id: string, @Param('status') status: OrderStatus) {
        return this.orderService.updateStatus(id, status)
    }

    @Patch(':id/cancel')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    async cancelOrder(@Param('id') id: string, @Request() req) {
        const order = await this.orderService.findOne(id)

        if (req.user.role === UserRole.CLIENT && order.user_id !== req.user.userId) {
            throw new NotFoundException('Order not found')
        }

        if (req.user.role === UserRole.ADMIN && order.restaurant_id !== req.user.restaurant_id) {
            throw new NotFoundException('Order not found')
        }

        return this.orderService.cancelOrder(id)
    }

    @Post('with-payment')
    @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.SUPERADMIN)
    async createOrderWithPayment(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        if (req.user && req.user.role !== UserRole.SUPERADMIN) {
            createOrderDto.user_id = req.user.userId;
        }
        return this.orderService.createOrderWithPayment(createOrderDto);
    }

    @Post(':id/verify-payment')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    async verifyOrderPayment(@Param('id') id: string, @Request() req) {
        const order = await this.orderService.findOne(id);
        
        if (req.user.role === UserRole.CLIENT && order.user_id !== req.user.userId) {
            throw new NotFoundException('Order not found');
        }
        
        if (req.user.role === UserRole.ADMIN && order.restaurant_id !== req.user.restaurant_id) {
            throw new NotFoundException('Order not found');
        }

        return this.orderService.verifyOrderPayment(id);
    }
}
