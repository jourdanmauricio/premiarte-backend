import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, type, status = 'pending', observation, products, totalAmount } = createOrderDto;

    if (!products?.length) {
      throw new BadRequestException('Debe incluir al menos un ítem en el pedido');
    }

    const customer = await this.prisma.client.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Cliente ${customerId} no encontrado`);
    }

    const productIds = products.map((i) => i.productId);
    const dbProducts = await this.prisma.client.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });

    if (dbProducts.length !== new Set(productIds).size) {
      const foundIds = new Set(dbProducts.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Productos no encontrados: ${missing.join(', ')}`);
    }

    const itemsData = products.map((item) => ({
      productId: item.productId,
      price: item.price,
      retailPrice: item.retailPrice,
      wholesalePrice: item.wholesalePrice,
      quantity: item.quantity,
      amount: item.amount,
      observation: item.observation ?? undefined,
    }));

    return this.prisma.client.order.create({
      data: {
        customerId,
        type,
        status,
        totalAmount,
        observation: observation ?? undefined,
        items: { create: itemsData },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.order.findMany({
      include: {
        items: { include: { product: true } },
        customer: {
          select: { id: true, name: true, email: true, phone: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { include: { image: true } },
              },
            },
          },
        },
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido ${id} no encontrado`);
    }

    order.items.forEach((item) => {
      if (item.product?.images) {
        (item.product as { images: unknown }).images = item.product.images.sort((a, b) => a.orderIndex - b.orderIndex).map((pi) => pi.image);
      }
    });

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    const { products, ...scalarFields } = updateOrderDto;
    const scalarData = Object.fromEntries(Object.entries(scalarFields).filter(([, v]) => v !== undefined)) as Prisma.OrderUpdateInput;

    let data: Prisma.OrderUpdateInput = { ...scalarData };

    if (products != null && products.length > 0) {
      if (products.some((i) => i.productId == null)) {
        throw new BadRequestException('Cada ítem debe incluir productId');
      }
      const productIds = products.map((i) => parseInt(String(i.productId), 10));
      const dbProducts = await this.prisma.client.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      const foundIds = new Set(dbProducts.map((p) => p.id));
      for (const pid of productIds) {
        if (!foundIds.has(pid)) {
          throw new BadRequestException(`Producto ${pid} no encontrado`);
        }
      }

      const totalAmount = updateOrderDto.totalAmount;
      if (totalAmount == null || totalAmount < 0) {
        throw new BadRequestException('totalAmount es requerido cuando se envían ítems');
      }

      const itemsCreate = products.map((item) => {
        const productId = parseInt(String(item.productId), 10);
        if (item.price == null || item.quantity == null || item.amount == null || item.retailPrice == null || item.wholesalePrice == null) {
          throw new BadRequestException('Cada ítem debe incluir price, quantity, amount, retailPrice y wholesalePrice (enviados por el front)');
        }
        return {
          productId,
          price: item.price,
          retailPrice: item.retailPrice,
          wholesalePrice: item.wholesalePrice,
          quantity: item.quantity,
          amount: item.amount,
          observation: item.observation ?? undefined,
        };
      });

      data = {
        ...data,
        totalAmount,
        items: {
          deleteMany: {},
          create: itemsCreate,
        },
      };
    }

    return this.prisma.client.order.update({
      where: { id },
      data,
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.order.delete({
      where: { id },
    });
    return { message: 'Pedido eliminado correctamente' };
  }
}
