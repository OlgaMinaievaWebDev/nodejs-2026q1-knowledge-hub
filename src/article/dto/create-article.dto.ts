import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ArticleStatus } from '../article.interfaces';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
  @IsOptional()
  @IsUUID()
  authorId?: string; // refers to User
  @IsOptional()
  @IsUUID()
  categoryId?: string; // refers to Category
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]; // array of tag names
}
