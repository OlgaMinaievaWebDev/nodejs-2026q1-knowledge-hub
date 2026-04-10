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
    return this.userService.getUsers();
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserWithoutPassword> {
    return this.userService.getUserById(id);
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserWithoutPassword> {
    return this.userService.createUser(dto);
  }

  @Put(':id')
  async updateUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ): Promise<UserWithoutPassword> {
    return this.userService.updateUserPassword(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
