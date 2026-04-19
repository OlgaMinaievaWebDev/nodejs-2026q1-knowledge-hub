import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ArticleModule } from 'src/article/article.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ArticleModule, PrismaModule, AuthModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
