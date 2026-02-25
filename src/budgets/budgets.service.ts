import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { MailService } from 'src/mail/mail.service';

/** Normaliza teléfono para búsqueda/guardado: trim y solo dígitos (evita duplicados por "11 5804-6525" vs "1158046525"). */
function normalizePhone(phone: string | null | undefined): string | null {
  if (phone == null || phone === '') return null;
  const digits = phone.trim().replace(/\D/g, '');
  return digits === '' ? null : digits;
}

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto) {
    const { name, email, phone, message, products } = createBudgetDto;

    if (!products?.length) {
      throw new BadRequestException('Debe incluir al menos un producto');
    }

    const productIds = products.map((p) => parseInt(String(p.id), 10));
    if (productIds.some((id) => Number.isNaN(id))) {
      throw new BadRequestException('IDs de producto inválidos');
    }

    const dbProducts = await this.prisma.client.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, retailPrice: true, wholesalePrice: true },
    });

    if (dbProducts.length !== productIds.length) {
      const foundIds = new Set(dbProducts.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Productos no encontrados: ${missing.join(', ')}`);
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const phoneNorm = normalizePhone(phone);
    const emailNorm = email?.trim() || null;

    const orConditions = [...(emailNorm ? [{ email: emailNorm }] : []), ...(phoneNorm ? [{ phone: phoneNorm }] : [])] as { email?: string; phone?: string }[];
    let customer = orConditions.length ? await this.prisma.client.customer.findFirst({ where: { OR: orConditions } }) : null;

    if (!customer) {
      try {
        customer = await this.prisma.client.customer.create({
          data: {
            name,
            email: emailNorm ?? undefined,
            phone: phoneNorm ?? phone?.trim() ?? undefined,
            type: 'retail',
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const c = (err as { cause?: { message?: string; originalMessage?: string } })?.cause;
        const causeMsg = [c?.message, c?.originalMessage].filter(Boolean).join(' ');
        const isUniquePhone = /UNIQUE constraint failed: Customer\.phone/i.test(msg) || /UNIQUE constraint failed: Customer\.phone/i.test(causeMsg);
        const isUniqueEmail = /UNIQUE constraint failed: Customer\.email/i.test(msg) || /UNIQUE constraint failed: Customer\.email/i.test(causeMsg);
        if (isUniquePhone || isUniqueEmail) {
          customer = orConditions.length ? await this.prisma.client.customer.findFirst({ where: { OR: orConditions } }) : null;
          if (phoneNorm && !customer) customer = await this.prisma.client.customer.findFirst({ where: { phone: phoneNorm } });
          if (phoneNorm && !customer) {
            const withPhone = await this.prisma.client.customer.findMany({ where: { phone: { not: null } } });
            customer = withPhone.find((c) => normalizePhone(c.phone) === phoneNorm) ?? null;
          }
          if (emailNorm && !customer) customer = await this.prisma.client.customer.findFirst({ where: { email: emailNorm } });
          if (!customer) throw err;
        } else {
          throw err;
        }
      }
    }

    let totalAmount = 0;

    const itemsData = products.map((item) => {
      const productId = parseInt(String(item.id), 10);
      const product = productMap.get(productId)!;
      const price = customer.type === 'retail' ? Number(product.retailPrice) : Number(product.wholesalePrice);
      const quantity = item.quantity;
      const amount = price * quantity;
      totalAmount += amount;

      return {
        productId,
        price,
        quantity,
        amount,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
      };
    });

    const budget = await this.prisma.client.budget.create({
      data: {
        customerId: customer.id,
        observation: message,
        totalAmount,
        status: 'pending',
        items: {
          create: itemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        customer: true,
      },
    });
    try {
      await this.mailService.sendBudgetNotification({
        customerName: customer.name,
        customerEmail: customer.email || emailNorm || '-',
        customerPhone: customer.phone || phone || '-',
        message: message || '-',
        totalAmount,
        items: budget.items.map((item) => ({
          productName: (item.product as { name?: string })?.name ?? 'Producto',
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
        })),
      });
    } catch (err) {
      console.error('Error al enviar email de presupuesto:', err);
      // No fallar la creación del presupuesto si falla el email
    }

    return budget;
  }

  async findAll() {
    return this.prisma.client.budget.findMany({
      include: {
        items: { include: { product: true } },
        customer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const budget = await this.prisma.client.budget.findUnique({
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

    if (!budget) {
      throw new NotFoundException(`Presupuesto ${id} no encontrado`);
    }

    // Aplanar images: devolver solo el objeto Image (sin ProductImage)
    budget.items.forEach((item) => {
      if (item.product?.images) {
        (item.product as { images: unknown }).images = item.product.images.sort((a, b) => a.orderIndex - b.orderIndex).map((pi) => pi.image);
      }
    });

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    await this.findOne(id);

    const { expiresAt, approvedAt, rejectedAt, customerId, products, ...scalarFields } = updateBudgetDto;

    const scalarData = Object.fromEntries(Object.entries(scalarFields).filter(([, v]) => v !== undefined)) as Prisma.BudgetUpdateInput;

    const data: Prisma.BudgetUpdateInput = {
      ...scalarData,
      ...(expiresAt != null && { expiresAt: new Date(expiresAt) }),
      ...(approvedAt != null && { approvedAt: new Date(approvedAt) }),
      ...(rejectedAt != null && { rejectedAt: new Date(rejectedAt) }),
      ...(customerId != null && {
        customer: { connect: { id: customerId } },
      }),
      ...(products != null &&
        products.length > 0 && {
          items: {
            deleteMany: {},
            create: products.map((item) => ({
              productId: parseInt(String(item.productId), 10),
              price: item.price ?? 0,
              quantity: item.quantity ?? 1,
              amount: item.amount ?? 0,
              observation: item.observation ?? undefined,
            })),
          },
        }),
    };

    return this.prisma.client.budget.update({
      where: { id },
      data,
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.client.budget.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.budget.delete({
      where: { id },
    });
    return { message: 'Presupuesto eliminado correctamente' };
  }
}
