import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
      message: 'Registration successful',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto);
    return {
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    };
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.authService.getCurrentUser(req.user.uid);
    return {
      success: true,
      data: user,
      message: 'User profile retrieved successfully',
    };
  }

  @Patch('change-password')
  @UseGuards(FirebaseAuthGuard)
  async changePassword(
    @Request() req,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.changePassword(req.user.uid, newPassword);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  async logout(@Request() req) {
    await this.authService.logout(req.user.uid);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('health')
  healthCheck() {
    return {
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
