import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/services/auth.service';
import { UserWithPassword } from 'src/users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseEntity } from '../entities/login-response.entity';
import { ForgotPasswordDto } from 'src/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

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

  @Post('forgot-password')
  @ApiOperation({ summary: 'Recuperar contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña recuperada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  resetPassword(@Body() body: ResetPasswordDto) {
    console.log('Reset password controller', body);
    return this.authService.resetPassword(body.token, body.password);
  }
}
