import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserWithoutPassword } from './user.interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserWithoutPassword[]> {
    return await this.userService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id', ParseUUIDPipe) id: string): UserWithoutPassword {
    return this.userService.getUserById(id);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto): UserWithoutPassword {
    return this.userService.createUser(dto);
  }

  @Put(':id')
  updateUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ): UserWithoutPassword {
    return this.userService.updateUserPassword(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    this.userService.deleteUser(id);
  }
}
