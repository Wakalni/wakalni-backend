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
import { JwtAccessGuard } from '../auth/guards/jwt-access-guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'
import { OrderStatus } from './entities/order.entity'
import { NotFoundException } from '@nestjs/common'

@Controller('orders')
@UseGuards(JwtAccessGuard, RolesGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.ADMIN)
    create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        if (req.user && req.user.role !== UserRole.ADMIN) {
            createOrderDto.user_id = req.user.userId
        }
        return this.orderService.create(createOrderDto)
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
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
    @Roles(UserRole.ADMIN, UserRole.ADMIN, UserRole.CLIENT)
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
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.update(id, updateOrderDto)
    }

    @Patch(':id/status/:status')
    @Roles(UserRole.ADMIN, UserRole.ADMIN)
    updateStatus(@Param('id') id: string, @Param('status') status: OrderStatus) {
        return this.orderService.updateStatus(id, status)
    }

    @Patch(':id/cancel')
    @Roles(UserRole.ADMIN, UserRole.ADMIN, UserRole.CLIENT)
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
    @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.ADMIN)
    async createOrderWithPayment(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        if (req.user && req.user.role !== UserRole.ADMIN) {
            createOrderDto.user_id = req.user.userId;
        }
        return this.orderService.createOrderWithPayment(createOrderDto);
    }

    @Post(':id/verify-payment')
    @Roles(UserRole.ADMIN, UserRole.ADMIN, UserRole.CLIENT)
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
