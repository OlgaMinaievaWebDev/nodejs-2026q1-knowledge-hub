import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ArticleModule } from 'src/article/article.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [ArticleModule, CommentModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
