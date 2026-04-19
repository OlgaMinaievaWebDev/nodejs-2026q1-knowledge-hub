import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.interfaces';
import { GetCommentsQueryDto } from './dto/get-comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';


@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getComments(@Query() query: GetCommentsQueryDto): Promise<Comment[]> {
    return this.commentService.getComments(query);
  }

  @Get(':id')
  async getCommentById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Comment> {
    return this.commentService.getCommentById(id);
  }

  @Post()
  async createComment(@Body() dto: CreateCommentDto): Promise<Comment> {
    return this.commentService.createComment(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commentService.deleteComment(id);
  }
}
