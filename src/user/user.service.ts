import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole, UserWithoutPassword } from './user.interfaces';
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
    const role = dto.role ?? UserRole.VIEWER;
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

  updateUserPassword(id: string, dto: UpdatePasswordDto): UserWithoutPassword {
    const existingUser = this.users.find((user) => user.id === id);
    if (!existingUser) throw new NotFoundException();
    if (dto.oldPassword !== existingUser.password)
      throw new ForbiddenException();
    existingUser.password = dto.newPassword;
    existingUser.updatedAt = Date.now();
    const safeUser = { ...existingUser };
    delete safeUser.password;
    return safeUser;
  }

  deleteUser(id: string): void {
    const existingUser = this.users.find((user) => user.id === id);
    if (!existingUser) throw new NotFoundException();
    this.users = this.users.filter((user) => user.id !== id);
  }
}
