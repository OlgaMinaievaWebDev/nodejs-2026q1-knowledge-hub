import { Injectable, NotFoundException } from '@nestjs/common';
import { Article, ArticleStatus } from './article.interfaces';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticleQueryDto } from './dto/get-articles-query.dto';

@Injectable()
export class ArticleService {
  articles: Article[] = [];

  getArticles(query: GetArticleQueryDto): Article[] {
    const { status, categoryId, tag } = query;
    return this.articles.filter((article) => {
      const matchStatus = status ? article.status === status : true;
      const matchCategoryId = categoryId
        ? article.categoryId === categoryId
        : true;

      const matchTag = tag ? article.tags.includes(tag) : true;
      return matchStatus && matchCategoryId && matchTag;
    });
  }

  getArticleById(id: string): Article {
    const existingArticle = this.articles.find((article) => article.id === id);
    if (!existingArticle) throw new NotFoundException();
    return existingArticle;
  }

  createArticle(dto: CreateArticleDto): Article {
    const status = dto.status ?? ArticleStatus.DRAFT;
    const newArticle: Article = {
      id: crypto.randomUUID(),
      title: dto.title,
      content: dto.content,
      status: status,
      authorId: dto.authorId ?? null,
      categoryId: dto.categoryId ?? null,
      tags: dto.tags ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.articles.push(newArticle);
    return newArticle;
  }
}
