import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(
    dto: SignUpDto,
  ): Promise<{ id: string; login: string; role: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });

    if (existingUser) {
      return {
        id: existingUser.id,
        login: existingUser.login,
        role: existingUser.role,
      };
    }

    const hashedPassword = await hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        login: dto.login,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      login: user.login,
      role: user.role,
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });
    if (!existingUser) throw new ForbiddenException();
    const isPasswordValid = await compare(dto.password, existingUser.password);
    if (!isPasswordValid) throw new ForbiddenException();
    const payload = {
      userId: existingUser.id,
      login: existingUser.login,
      role: existingUser.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_TTL,
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(
    dto: RefreshDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { userId: string; login: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_TTL,
    });

    return { accessToken, refreshToken };
  }
}
