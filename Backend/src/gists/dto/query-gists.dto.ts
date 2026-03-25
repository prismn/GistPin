import { IsLatitude, IsLongitude, IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryGistsDto {
  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @IsLongitude()
  @Type(() => Number)
  lon: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(5000)
  @Type(() => Number)
  radius?: number = 500;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}
