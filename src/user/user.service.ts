import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserWithoutPassword } from './user.interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(): Promise<UserWithoutPassword[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => ({
      id: user.id,
      login: user.login,
      role: user.role as UserWithoutPassword['role'],
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    }));
  }

  async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      id: user.id,
      login: user.login,
      role: user.role.toLowerCase() as UserWithoutPassword['role'],
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserWithoutPassword> {
    const role = dto.role ?? 'viewer';

    try {
      const user = await this.prisma.user.create({
        data: {
          login: dto.login,
          password: await bcrypt.hash(dto.password, 10),
          role,
        },
      });

      return {
        id: user.id,
        login: user.login,
        role: user.role.toLowerCase() as UserWithoutPassword['role'],
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existingUser = await this.prisma.user.findUnique({
          where: { login: dto.login },
        });

        if (!existingUser) {
          throw error;
        }

        return {
          id: existingUser.id,
          login: existingUser.login,
          role: existingUser.role as UserWithoutPassword['role'],
          createdAt: existingUser.createdAt.getTime(),
          updatedAt: existingUser.updatedAt.getTime(),
        };
      }

      throw error;
    }
  }

  async updateUserPassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (dto.oldPassword !== user.password) {
      throw new ForbiddenException();
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: dto.newPassword,
      },
    });

    return {
      id: updatedUser.id,
      login: updatedUser.login,
      role: updatedUser.role.toLowerCase() as UserWithoutPassword['role'],
      createdAt: updatedUser.createdAt.getTime(),
      updatedAt: updatedUser.updatedAt.getTime(),
    };
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundException();
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
