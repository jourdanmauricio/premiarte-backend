import { ApiProperty } from '@nestjs/swagger';

export class ImportCustomersResultDto {
  @ApiProperty({ description: 'Cantidad de clientes importados correctamente' })
  imported: number;

  @ApiProperty({ description: 'Cantidad de filas omitidas por duplicado (teléfono o email ya existente)' })
  skipped: number;

  @ApiProperty({
    description: 'Errores por fila (número de fila en el archivo y motivo)',
    type: 'array',
    items: {
      type: 'object',
      properties: { row: { type: 'number' }, reason: { type: 'string' } },
    },
  })
  errors: { row: number; reason: string }[];
}
