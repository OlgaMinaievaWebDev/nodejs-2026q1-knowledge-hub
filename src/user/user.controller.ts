import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserWithoutPassword } from './user.interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): UserWithoutPassword[] {
    return this.userService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: string): UserWithoutPassword {
    return this.userService.getUserById(id);
  }
}
