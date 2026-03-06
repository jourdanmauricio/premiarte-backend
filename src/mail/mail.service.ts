import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EnvModels } from 'env.models';

export interface BudgetEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }>;
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService<EnvModels>,
  ) {}

  async sendBudgetNotification(data: BudgetEmailData): Promise<void> {
    const to = this.config.getOrThrow('BUDGET_NOTIFICATION_EMAIL', { infer: true });
    if (!to) {
      console.warn('BUDGET_NOTIFICATION_EMAIL o ADMIN_USER_EMAIL no configurado, no se envía email');
      return;
    }

    const itemsHtml = data.items
      .map(
        (i) => `
      <tr>
        <td>${i.productName}</td>
        <td>${i.quantity}</td>
        <td>${i.description}</td>
      </tr>`,
      )
      .join('');

    const html = `
      <h2>PremiArte - Solicitud de presupuesto</h2>
      <p><strong>Nombre:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Teléfono:</strong> ${data.customerPhone}</p>
      <p><strong>Mensaje:</strong> ${data.message || '-'}</p>
      <h3>Productos solicitados</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="width: 90%; margin: 0 auto;">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    `;

    await this.mailer.sendMail({
      to,
      subject: `Nuevo presupuesto - ${data.customerName}`,
      html,
      text: `Nueva solicitud de presupuesto de ${data.customerName} (${data.customerEmail}). Total: $${(data.totalAmount / 100).toFixed(2)}`,
    });
  }

  async sendContactNotification(data: ContactEmailData): Promise<void> {
    const to = this.config.get('CONTACT_NOTIFICATION_EMAIL', { infer: true }) ?? this.config.get('BUDGET_NOTIFICATION_EMAIL', { infer: true }) ?? this.config.get('ADMIN_USER_EMAIL', { infer: true });
    if (!to) {
      console.warn('CONTACT_NOTIFICATION_EMAIL, BUDGET_NOTIFICATION_EMAIL o ADMIN_USER_EMAIL no configurado, no se envía email de contacto');
      return;
    }

    const html = `
      <h2>PremiArte - Consulta de contacto</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      <p><strong>Teléfono:</strong> ${data.phone || '-'}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${data.message.replace(/\n/g, '<br />')}</p>
      <br />
    `;

    await this.mailer.sendMail({
      to,
      subject: `Nueva consulta - ${data.name}`,
      html,
      text: `Nueva consulta de contacto de ${data.name} (${data.email}). Mensaje: ${data.message}`,
    });
  }

  async sendForgotPasswordEmail(email: string, token: string): Promise<void> {
    const html = `
    <h2>Recuperación de contraseña</h2>
      <p>Para recuperar tu contraseña, ingresa al siguiente enlace:</p>
      <a href="https://premiartedashboard.lumau.com.ar/reset-password?token=${token}">Recuperar contraseña</a>
    `;

    await this.mailer.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html,
      text: `Recuperación de contraseña para ${email}. Ingresar al siguiente enlace para recuperar la contraseña: https://premiartedashboard.lumau.com.ar/reset-password?token=${token}`,
    });
  }

  async sendBackupEmail(sqlContent: string): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `backup_${process.env.TURSO_DB_NAME}_${date}.sql`;

    const to = this.config.get('BACKUP_EMAIL_RECIPIENT', { infer: true });
    if (!to) {
      console.warn('BACKUP_EMAIL_RECIPIENT no configurado, no se envía email de backup');
      return;
    }

    await this.mailer.sendMail({
      to,
      subject: `Backup BD - ${date}`,
      text: `Adjunto encontrás el backup de la base de datos generado el ${date}.`,
      attachments: [
        {
          filename,
          content: sqlContent,
          contentType: 'text/plain',
        },
      ],
    });
  }
}
