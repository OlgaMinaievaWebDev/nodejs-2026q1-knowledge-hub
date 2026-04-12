import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from './article.interfaces';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticleQueryDto } from './dto/get-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ArticleStatus as PrismaArticleStatus } from '@prisma/client';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticles(query: GetArticleQueryDto): Promise<Article[]> {
    const { status, categoryId, tag } = query;
    const where: Prisma.ArticleWhereInput = {};

    if (status) {
      where.status = status.toUpperCase() as PrismaArticleStatus;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    const articles = await this.prisma.article.findMany({
      where,
      include: {
        tags: true,
      },
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status.toLowerCase() as Article['status'],
      authorId: article.authorId,
      categoryId: article.categoryId,
      tags: article.tags.map((tag) => tag.name),
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    }));
  }

  async getArticleById(id: string): Promise<Article> {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingArticle) {
      throw new NotFoundException();
    }

    return {
      id: existingArticle.id,
      title: existingArticle.title,
      content: existingArticle.content,
      status: existingArticle.status.toLowerCase() as Article['status'],
      authorId: existingArticle.authorId,
      categoryId: existingArticle.categoryId,
      tags: existingArticle.tags.map((tag) => tag.name),
      createdAt: existingArticle.createdAt.getTime(),
      updatedAt: existingArticle.updatedAt.getTime(),
    };
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status
          ? (dto.status.toUpperCase() as PrismaArticleStatus)
          : PrismaArticleStatus.DRAFT,
        categoryId: dto.categoryId ?? null,
        authorId: dto.authorId ?? null,
        tags: dto.tags?.length
          ? {
              connectOrCreate: dto.tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status.toLowerCase() as Article['status'],
      authorId: article.authorId,
      categoryId: article.categoryId,
      tags: article.tags.map((tag) => tag.name),
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    };
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<Article> {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingArticle) {
      throw new NotFoundException();
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status
          ? (dto.status.toUpperCase() as PrismaArticleStatus)
          : undefined,
        authorId: dto.authorId,
        categoryId: dto.categoryId,
        tags:
          dto.tags !== undefined
            ? {
                set: [],
                connectOrCreate: dto.tags.map((name: string) => ({
                  where: { name },
                  create: { name },
                })),
              }
            : undefined,
      },
      include: {
        tags: true,
      },
    });

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status.toLowerCase() as Article['status'],
      authorId: article.authorId,
      categoryId: article.categoryId,
      tags: article.tags.map((tag) => tag.name),
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    };
  }
  async deleteArticle(id: string): Promise<void> {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new NotFoundException();
    }

    await this.prisma.article.delete({
      where: { id },
    });
  }

  async clearAuthorIdByUserId(userId: string): Promise<void> {
    await this.prisma.article.updateMany({
      where: { authorId: userId },
      data: { authorId: null },
    });
  }

  async clearCategoryById(id: string): Promise<void> {
    await this.prisma.article.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!article;
  }
}
