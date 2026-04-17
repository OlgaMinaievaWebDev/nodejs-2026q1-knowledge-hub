import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
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

    const user = await this.prisma.user.create({
      data: {
        login: dto.login,
        password: hashedPassword,
      },
    });
    return { message: 'User created' };
  }
}
