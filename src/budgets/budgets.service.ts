import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { MailService } from 'src/mail/mail.service';

type BudgetItemWithProduct = { product: { name?: string }; quantity: number; price: number; amount: number };
type MailBudgetItem = { productName: string; quantity: number; price: number; amount: number };

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
    const { customerId, name, email, phone, message, observation, responsibleId, expiresAt, type, totalAmount: dtoTotalAmount, status, showCuit, products } = createBudgetDto;

    if (!products?.length) {
      throw new BadRequestException('Debe incluir al menos un producto');
    }

    // Resolver cliente: por customerId (dashboard) o por name/email/phone (front)
    let customer: { id: string; name: string; email: string | null; phone: string | null; type: string };
    if (customerId) {
      const found = await this.prisma.client.customer.findUnique({ where: { id: customerId } });
      if (!found) throw new BadRequestException(`Cliente no encontrado: ${customerId}`);
      customer = found;
    } else {
      if (!name || !email || !phone) throw new BadRequestException('Cuando no se envía customerId, name, email y phone son requeridos');
      const phoneNorm = normalizePhone(phone);
      const emailNorm = email?.trim() || null;
      const orConditions = [...(emailNorm ? [{ email: emailNorm }] : []), ...(phoneNorm ? [{ phone: phoneNorm }] : [])] as {
        email?: string;
        phone?: string;
      }[];
      let c = orConditions.length ? await this.prisma.client.customer.findFirst({ where: { OR: orConditions } }) : null;
      if (!c) {
        try {
          c = await this.prisma.client.customer.create({
            data: {
              name,
              email: emailNorm ?? undefined,
              phone: phoneNorm ?? phone?.trim() ?? undefined,
              type: 'retail',
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          const cause = (err as { cause?: { message?: string; originalMessage?: string } })?.cause;
          const causeMsg = [cause?.message, cause?.originalMessage].filter(Boolean).join(' ');
          const isUniquePhone = /UNIQUE constraint failed: Customer\.phone/i.test(msg) || /UNIQUE constraint failed: Customer\.phone/i.test(causeMsg);
          const isUniqueEmail = /UNIQUE constraint failed: Customer\.email/i.test(msg) || /UNIQUE constraint failed: Customer\.email/i.test(causeMsg);
          if (isUniquePhone || isUniqueEmail) {
            c = orConditions.length ? await this.prisma.client.customer.findFirst({ where: { OR: orConditions } }) : null;
            if (phoneNorm && !c) c = await this.prisma.client.customer.findFirst({ where: { phone: phoneNorm } });
            if (phoneNorm && !c) {
              const withPhone = await this.prisma.client.customer.findMany({ where: { phone: { not: null } } });
              c = withPhone.find((x) => normalizePhone(x.phone) === phoneNorm) ?? null;
            }
            if (emailNorm && !c) c = await this.prisma.client.customer.findFirst({ where: { email: emailNorm } });
            if (!c) throw err;
          } else {
            throw err;
          }
        }
      }
      customer = c;
    }

    const productIds = products.map((p) => parseInt(String(p.id ?? p.productId), 10));
    if (productIds.some((id) => Number.isNaN(id))) {
      throw new BadRequestException('IDs de producto inválidos: cada ítem debe tener id o productId');
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
    const isDashboardFlow = products.some((p) => p.price != null && p.amount != null);

    let totalAmount = 0;
    const itemsData = products.map((item) => {
      const productId = parseInt(String(item.id ?? item.productId), 10);
      const product = productMap.get(productId)!;
      let price: number;
      let quantity: number;
      let amount: number;
      if (item.price != null && item.amount != null) {
        price = Number(item.price);
        amount = Number(item.amount);
        quantity = item.quantity ?? (price > 0 ? Math.round(amount / price) : 1);
      } else {
        price = customer.type === 'retail' ? Number(product.retailPrice) : Number(product.wholesalePrice);
        quantity = item.quantity ?? 1;
        amount = price * quantity;
      }
      totalAmount += amount;

      return {
        productId,
        price,
        quantity,
        amount,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        observation: item.observation ?? undefined,
      };
    });

    const obs = observation ?? message;
    const finalTotal = dtoTotalAmount != null ? Number(dtoTotalAmount) : totalAmount;
    const showCuitValue: boolean = showCuit === true;

    const budget = await this.prisma.client.$transaction(async (tx) => {
      const last = (await tx.budget.findFirst({
        orderBy: { number: 'desc' },
        select: { number: true },
      })) as { number: number } | null;
      const nextNumber = (last?.number ?? 399) + 1;
      return tx.budget.create({
        data: {
          number: nextNumber,
          customerId: customer.id,
          showCuit: showCuitValue,
          observation: obs ?? undefined,
          totalAmount: finalTotal,
          status: status ?? 'pending',
          ...(responsibleId != null && { responsibleId }),
          ...(expiresAt != null && { expiresAt: new Date(expiresAt) }),
          ...(type != null && { type }),
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
    });

    if (!isDashboardFlow) {
      try {
        const items = (budget.items as BudgetItemWithProduct[]).map(
          (item): MailBudgetItem => ({
            productName: item.product?.name ?? 'Producto',
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
          }),
        );
        await this.mailService.sendBudgetNotification({
          customerName: customer.name,
          customerEmail: customer.email || email?.trim() || '-',
          customerPhone: customer.phone || phone || '-',
          message: obs || '-',
          totalAmount: finalTotal,
          items,
        });
      } catch (err) {
        console.error('Error al enviar email de presupuesto:', err);
      }
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
