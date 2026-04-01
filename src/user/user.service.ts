import { Injectable } from '@nestjs/common';
import { User, UserWithoutPassword } from './user.interfaces';

@Injectable()
export class UserService {
  users: User[] = [];

  getUsers(): UserWithoutPassword[] {
    return this.users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });
  }
}
