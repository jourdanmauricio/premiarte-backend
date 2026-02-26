import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService, UserWithPassword } from 'src/users/services/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Payload, isForgotPasswordPayload } from 'src/auth/models/payload.model';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mail: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<UserWithPassword, 'password'>> {
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  generateToken(user: Pick<UserWithPassword, 'email' | 'id'>): string {
    const payload: Payload = { sub: user.id };
    return this.jwtService.sign(payload);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // enviar email con el token de recuperacion de contraseña
    const token = this.jwtService.sign({ email: user.email }, { expiresIn: '1h' });
    await this.mail.sendForgotPasswordEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log('Reset password service', token, newPassword);
    let raw: unknown;
    try {
      raw = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (!isForgotPasswordPayload(raw)) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.usersService.findOneByEmailWithPassword(raw.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.setPasswordById(user.id, newPassword);
  }
}
