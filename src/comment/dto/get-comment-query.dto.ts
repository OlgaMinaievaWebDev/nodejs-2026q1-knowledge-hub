import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetCommentsQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  articleId: string;
}
