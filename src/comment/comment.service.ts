import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Comment } from './comment.interfaces';
import { GetCommentsQueryDto } from './dto/get-comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async getComments(query: GetCommentsQueryDto): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { articleId: query.articleId },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      authorId: comment.authorId,
      createdAt: comment.createdAt.getTime(),
    }));
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException();
    }

    return {
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      authorId: comment.authorId,
      createdAt: comment.createdAt.getTime(),
    };
  }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
      select: { id: true },
    });

    if (!article) {
      throw new UnprocessableEntityException();
    }

    const data =
      dto.authorId === null || dto.authorId === undefined
        ? {
            content: dto.content,
            articleId: dto.articleId,
          }
        : {
            content: dto.content,
            articleId: dto.articleId,
            authorId: dto.authorId,
          };

    const comment = await this.prisma.comment.create({ data });

    return {
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      authorId: comment.authorId,
      createdAt: comment.createdAt.getTime(),
    };
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException();
    }

    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
