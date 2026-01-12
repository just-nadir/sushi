import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;
}
