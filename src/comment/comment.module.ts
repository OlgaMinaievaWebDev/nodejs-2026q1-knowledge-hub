import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ArticleModule } from 'src/article/article.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ArticleModule, PrismaModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
