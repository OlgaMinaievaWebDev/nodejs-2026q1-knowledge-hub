import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Query,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article } from './article.interfaces';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticleQueryDto } from './dto/get-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getArticles(@Query() query: GetArticleQueryDto): Promise<Article[]> {
    return this.articleService.getArticles(query);
  }

  @Get(':id')
  async getArticleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Article> {
    return this.articleService.getArticleById(id);
  }

  @Post()
  async createArticle(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.articleService.createArticle(dto);
  }

  @Put(':id')
  async updateArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articleService.updateArticle(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteArticle(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.articleService.deleteArticle(id);
  }
}
