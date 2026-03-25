import { IsLatitude, IsLongitude, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateGistDto {
  @IsString()
  @MaxLength(280)
  content: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lon: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  author?: string;
}
