import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article } from './article.interfaces';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getArticles(): Article[] {
    return this.articleService.getArticles();
  }

  @Get(':id')
  getArticleById(@Param('id', ParseUUIDPipe) id: string): Article {
    return this.articleService.getArticleById(id);
  }

  @Post()
  createArticle(@Body() dto: CreateArticleDto): Article {
    return this.articleService.createArticle(dto);
  }
}
