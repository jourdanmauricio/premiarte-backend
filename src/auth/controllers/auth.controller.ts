import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/services/auth.service';
import { UserWithPassword } from 'src/users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseEntity } from '../entities/login-response.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso', type: LoginResponseEntity })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Req() req: Request) {
    const user = req.user as UserWithPassword;
    return {
      user,
      access_token: this.authService.generateToken(user),
    };
  }
}
