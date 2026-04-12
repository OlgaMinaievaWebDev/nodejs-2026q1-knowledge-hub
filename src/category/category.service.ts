import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './category.interfaces';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany();

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }));
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
    };
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Category name must be unique');
      }

      throw error;
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException();
    }

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Category name must be unique');
      }

      throw error;
    }
  }
  async deleteCategory(id: string): Promise<void> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException();
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
