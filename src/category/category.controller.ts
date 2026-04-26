import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.interfaces';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories(): Promise<Category[]> {
    return this.categoryService.getCategories();
  }

  @Get(':id')
  async getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(dto);
  }

  @Put(':id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.categoryService.deleteCategory(id);
  }
}
