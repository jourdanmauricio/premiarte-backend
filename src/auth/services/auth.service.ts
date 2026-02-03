import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService, UserWithPassword } from 'src/users/services/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/auth/models/payload.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
