import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './category.interfaces';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
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
      id: crypto.randomUUID(),
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

  deleteCategory(id: string) {
    const existingCategory = this.categories.find(
      (category) => category.id === id,
    );
    if (!existingCategory) throw new NotFoundException();
    this.categories = this.categories.filter((category) => category.id !== id);
  }
}
