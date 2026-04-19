import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetCommentsQueryDto {
  @IsUUID()
  @IsNotEmpty()
  articleId: string;
}
