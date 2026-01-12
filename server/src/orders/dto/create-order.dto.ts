import { OrderType } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {
    @IsEnum(OrderType)
    type: OrderType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    locationLat?: number;

    @IsOptional()
    @IsNumber()
    locationLon?: number;

    @IsOptional()
    @IsString()
    comment?: string;

    // Guest Info
    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsOptional()
    @IsString()
    paymentType?: string;

    @IsOptional()
    @IsString()
    userTelegramId?: string;
}
