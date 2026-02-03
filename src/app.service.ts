import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvModels } from 'env.models';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<EnvModels>) {}

  getHealth(): string {
    return `Servidor corriendo correctamente en el puerto ${this.configService.get('PORT', { infer: true })}`;
  }
}
