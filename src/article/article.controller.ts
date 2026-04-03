import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article } from './article.interfaces';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticleQueryDto } from './dto/get-articles-query.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getArticles(@Query() query: GetArticleQueryDto): Article[] {
    return this.articleService.getArticles(query);
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
