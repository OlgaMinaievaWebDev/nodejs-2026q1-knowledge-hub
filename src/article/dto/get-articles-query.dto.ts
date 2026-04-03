import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ArticleStatus } from '../article.interfaces';

export class GetArticleQueryDto {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
  @IsOptional()
  @IsUUID()
  categoryId?: string;
  @IsString()
  @IsOptional()
  tag?: string;
}
