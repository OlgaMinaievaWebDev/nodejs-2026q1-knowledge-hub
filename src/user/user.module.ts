import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ArticleModule } from 'src/article/article.module';
import { CommentModule } from 'src/comment/comment.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ArticleModule, CommentModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
