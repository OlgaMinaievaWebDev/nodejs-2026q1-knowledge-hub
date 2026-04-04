import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Comment } from './comment.interfaces';
import { GetCommentsQueryDto } from './dto/get-comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class CommentService {
  constructor(
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
  ) {}
  comments: Comment[] = [];

  getComments(query: GetCommentsQueryDto): Comment[] {
    return this.comments.filter(
      (comment) => comment.articleId === query.articleId,
    );
  }

  getCommentById(id: string): Comment {
    const existingComment = this.comments.find((comment) => comment.id === id);
    if (!existingComment) throw new NotFoundException();
    return existingComment;
  }

  createComment(dto: CreateCommentDto): Comment {
    const exists = this.articleService.existsById(dto.articleId);

    if (!exists) {
      throw new UnprocessableEntityException();
    }

    const newComment: Comment = {
      id: crypto.randomUUID(),
      content: dto.content,
      articleId: dto.articleId,
      authorId: dto.authorId ?? null,
      createdAt: Date.now(),
    };

    this.comments.push(newComment);
    return newComment;
  }

  deleteComment(id: string) {
    const existingComment = this.comments.find((comment) => comment.id === id);
    if (!existingComment) throw new NotFoundException();
    this.comments = this.comments.filter((comment) => comment.id !== id);
  }

  deleteCommentsByArticleId(articleId: string): void {
    this.comments = this.comments.filter(
      (comment) => comment.articleId !== articleId,
    );
  }

  deleteCommentsByAuthorId(authorId: string): void {
    this.comments = this.comments.filter(
      (comment) => comment.authorId !== authorId,
    );
  }
}
