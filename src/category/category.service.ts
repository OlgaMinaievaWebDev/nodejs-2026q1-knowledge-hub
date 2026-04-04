import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Category } from './category.interfaces';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class CategoryService {
  constructor(private readonly articleService: ArticleService) {}
  categories: Category[] = [];

  getCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category {
    const existingCategory = this.categories.find(
      (category) => category.id === id,
    );
    if (!existingCategory) throw new NotFoundException();
    return existingCategory;
  }

  createCategory(dto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  updateCategory(id: string, dto: UpdateCategoryDto): Category {
    const existingCategory = this.categories.find(
      (category) => category.id === id,
    );
    if (!existingCategory) throw new NotFoundException();
    existingCategory.name = dto.name;
    existingCategory.description = dto.description;
    return existingCategory;
  }

  deleteCategory(id: string): void {
    const existingCategory = this.categories.find(
      (category) => category.id === id,
    );
    if (!existingCategory) throw new NotFoundException();
    this.articleService.clearCategoryById(id);
    this.categories = this.categories.filter((category) => category.id !== id);
  }
}
