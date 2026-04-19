import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ArticleModule } from 'src/article/article.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ArticleModule, AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
