import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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

  async signUp(dto: SignUpDto): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const password = dto.password;
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    await this.prisma.user.create({
      data: {
        login: dto.login,
        password: hashedPassword,
      },
    });
    return { message: 'User created' };
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
      expiresIn: '7d',
      secret: 'different-refresh-token-secret',
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(
    dto: RefreshDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { userId: string; login: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: 'different-refresh-token-secret',
      });
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: 'different-refresh-token-secret',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
