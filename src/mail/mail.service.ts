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

    const itemsHtml = data.items.map((i) => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>$${(i.price / 100).toFixed(2)}</td><td>$${(i.amount / 100).toFixed(2)}</td></tr>`).join('');

    const html = `
      <h2>Nueva solicitud de presupuesto</h2>
      <p><strong>Cliente:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Teléfono:</strong> ${data.customerPhone}</p>
      <p><strong>Mensaje:</strong> ${data.message || '-'}</p>
      <h3>Productos solicitados</h3>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unit.</th><th>Subtotal</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total:</strong> $${(data.totalAmount / 100).toFixed(2)}</p>
      <br />
      <p><strong>Recuerda:</strong> asignar un responsable para el seguimiento del presupuesto. </p>
      <br />
      <p><strong>Para ver el presupuesto, ingresa a la sección de presupuestos en el panel de administración.</strong></p>
      <a href="https://premiartedashboard.lumau.com.ar/dashboard/budgets">Panel de administración</a>
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
      <h2>Nueva consulta de contacto</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      <p><strong>Teléfono:</strong> ${data.phone || '-'}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${data.message.replace(/\n/g, '<br />')}</p>
      <br />
      <p><strong>Para ver todas las consultas, ingresa al panel de administración.</strong></p>
      <a href="https://premiartedashboard.lumau.com.ar/dashboard/contacts">Panel de administración</a>
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
}
