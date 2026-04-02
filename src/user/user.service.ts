import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserWithoutPassword } from './user.interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  users: User[] = [];

  getUsers(): UserWithoutPassword[] {
    return this.users.map((user) => {
      const safeUser = { ...user };
      delete safeUser.password;
      return safeUser;
    });
  }

  getUserById(id: string): UserWithoutPassword {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException();
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
  }

  createUser(dto: CreateUserDto): UserWithoutPassword {
    const role = dto.role ?? 'viewer';
    const newUser: User = {
      id: crypto.randomUUID(),
      login: dto.login,
      password: dto.password,
      role: role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const safeUser = { ...newUser };
    delete safeUser.password;
    this.users.push(newUser);
    return safeUser;
  }

  updateUserPassword(id, dto: UpdatePasswordDto) {}
}
