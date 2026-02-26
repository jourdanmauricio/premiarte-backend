import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as XLSX from 'xlsx';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ImportCustomersResultDto } from './dto/import-customers-result.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

function mensajeConflictoCliente(error: unknown): string {
  const meta = (error as { meta?: { target?: string[] } })?.meta;
  const campo = meta?.target?.[0];
  const textos: Record<string, string> = {
    name: 'nombre',
    phone: 'teléfono',
    email: 'email',
  };
  const campoTexto = campo ? (textos[campo] ?? campo) : 'teléfono';
  return `Ya existe un cliente con ese ${campoTexto}`;
}

/** Detecta conflicto por unique: Prisma P2002 o DriverAdapterError (LibSQL/Turso) */
function isConflictError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
    return true;
  }
  const msg = (error as { cause?: { message?: string }; message?: string })?.cause?.message ?? (error as { message?: string })?.message;
  return typeof msg === 'string' && /UNIQUE constraint failed: Customer\.(phone|email|name)/i.test(msg);
}

function mensajeConflictoDesdeError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
    return mensajeConflictoCliente(error);
  }
  const msg = (error as { cause?: { message?: string } })?.cause?.message ?? (error as { message?: string })?.message;
  const match = typeof msg === 'string' && msg.match(/Customer\.(phone|email|name)/i);
  const campo = match ? { phone: 'teléfono', email: 'email', name: 'nombre' }[match[1].toLowerCase()] : 'teléfono';
  return `Ya existe un cliente con ese ${campo}`;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.client.customer.create({
        data: {
          name: createCustomerDto.name,
          email: createCustomerDto.email?.trim() || undefined,
          phone: createCustomerDto.phone,
          type: createCustomerDto.type ?? 'retail',
          document: createCustomerDto.document ?? undefined,
          address: createCustomerDto.address ?? undefined,
          observation: createCustomerDto.observation ?? undefined,
        },
      });
    } catch (error: unknown) {
      if (isConflictError(error)) {
        throw new ConflictException(mensajeConflictoDesdeError(error));
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id);

    try {
      return await this.prisma.client.customer.update({
        where: { id },
        data: {
          ...(updateCustomerDto.name != null && { name: updateCustomerDto.name }),
          ...(updateCustomerDto.email !== undefined && { email: updateCustomerDto.email?.trim() || null }),
          ...(updateCustomerDto.phone != null && { phone: updateCustomerDto.phone }),
          ...(updateCustomerDto.type != null && { type: updateCustomerDto.type }),
          ...(updateCustomerDto.document !== undefined && { document: updateCustomerDto.document }),
          ...(updateCustomerDto.address !== undefined && { address: updateCustomerDto.address }),
          ...(updateCustomerDto.observation !== undefined && { observation: updateCustomerDto.observation }),
        },
      });
    } catch (error: unknown) {
      if (isConflictError(error)) {
        throw new ConflictException(mensajeConflictoDesdeError(error));
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.customer.delete({
      where: { id },
    });
    return { message: 'Cliente eliminado correctamente' };
  }

  /**
   * Importa clientes desde un archivo Excel (.xlsx) o CSV.
   * Columnas esperadas: name, document, email, address, phone, type (primera fila = encabezados).
   */
  async importFromFile(buffer: Buffer, filename: string): Promise<ImportCustomersResultDto> {
    const result: ImportCustomersResultDto = { imported: 0, skipped: 0, errors: [] };
    const ext = filename.toLowerCase().split('.').pop();
    const isCsv = ext === 'csv';

    let workbook: XLSX.WorkBook;
    try {
      if (isCsv) {
        workbook = XLSX.read(buffer.toString('utf-8'), { type: 'string', raw: false });
      } else {
        workbook = XLSX.read(buffer, { type: 'buffer', raw: false });
      }
    } catch {
      throw new BadRequestException('El archivo no es un Excel o CSV válido');
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new BadRequestException('El archivo no contiene ninguna hoja');
    }
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false });

    const normalize = (v: unknown): string => (v == null || v === '' ? '' : String(v).trim());
    const optional = (v: string): string | undefined => (v === '' ? undefined : v);
    const typeValue = (v: string): 'retail' | 'wholesale' => (v === 'wholesale' ? 'wholesale' : 'retail');

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // 1-based + header
      const raw = rows[i];
      const get = (key: string) => normalize(raw[key] ?? raw[key.toLowerCase()] ?? '');

      const name = get('name');
      if (!name) {
        result.errors.push({ row: rowIndex, reason: 'Nombre vacío' });
        continue;
      }

      const dto: CreateCustomerDto = {
        name,
        document: optional(get('document')) ?? undefined,
        email: optional(get('email')) ?? undefined,
        address: optional(get('address')) ?? undefined,
        phone: optional(get('phone')) ?? undefined,
        type: typeValue(get('type')),
      };

      try {
        await this.create(dto);
        result.imported++;
      } catch (error: unknown) {
        if (isConflictError(error)) {
          result.skipped++;
        } else {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          result.errors.push({ row: rowIndex, reason: message });
        }
      }
    }

    return result;
  }
}
