import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Article, ArticleStatus } from './article.interfaces';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticleQueryDto } from './dto/get-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
  ) {}
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
      id: randomUUID(),
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

  updateArticle(id: string, dto: UpdateArticleDto): Article {
    const existingArticle = this.articles.find((article) => article.id === id);
    if (!existingArticle) throw new NotFoundException();
    if (dto.title !== undefined) existingArticle.title = dto.title;
    if (dto.content !== undefined) existingArticle.content = dto.content;
    if (dto.status !== undefined) existingArticle.status = dto.status;
    if (dto.authorId !== undefined) existingArticle.authorId = dto.authorId;
    if (dto.categoryId !== undefined)
      existingArticle.categoryId = dto.categoryId;
    if (dto.tags !== undefined) existingArticle.tags = dto.tags;
    existingArticle.updatedAt = Date.now();
    return existingArticle;
  }

  deleteArticle(id: string): void {
    const existingArticle = this.articles.find((article) => article.id === id);
    if (!existingArticle) throw new NotFoundException();

    this.commentService.deleteCommentsByArticleId(id);

    this.articles = this.articles.filter((article) => article.id !== id);
  }

  clearCategoryById(id: string): void {
    this.articles.forEach((article) => {
      if (article.categoryId === id) article.categoryId = null;
    });
  }

  clearAuthorIdByUserId(userId: string): void {
    this.articles.forEach((article) => {
      if (article.authorId === userId) article.authorId = null;
    });
  }

  existsById(id: string): boolean {
    return this.articles.some((article) => article.id === id);
  }
}
