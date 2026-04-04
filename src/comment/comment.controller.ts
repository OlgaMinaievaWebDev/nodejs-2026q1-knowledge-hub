import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Post,
  Body,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { GetCommentsQueryDto } from './dto/get-comment-query.dto';
import { Comment } from './comment.interfaces';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  getComments(@Query() query: GetCommentsQueryDto): Comment[] {
    return this.commentService.getComments(query);
  }

  @Get(':id')
  getCommentById(@Param('id', ParseUUIDPipe) id: string): Comment {
    return this.commentService.getCommentById(id);
  }

  @Post()
  createComment(@Body() dto: CreateCommentDto) {
    return this.commentService.createComment(dto);
  }
}
