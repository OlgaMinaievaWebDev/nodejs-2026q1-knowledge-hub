import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserWithoutPassword } from './user.interfaces';

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
}
