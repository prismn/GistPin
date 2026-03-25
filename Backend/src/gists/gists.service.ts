import { Injectable } from '@nestjs/common';
import { CreateGistDto } from './dto/create-gist.dto';
import { QueryGistsDto } from './dto/query-gists.dto';
import { GistRepository } from './gist.repository';
import { Gist } from './entities/gist.entity';

@Injectable()
export class GistsService {
  constructor(private readonly gistRepository: GistRepository) {}

  async create(dto: CreateGistDto): Promise<Gist> {
    return this.gistRepository.create({
      content: dto.content,
      lat: dto.lat,
      lon: dto.lon,
    });
  }

  async findNearby(query: QueryGistsDto): Promise<Gist[]> {
    return this.gistRepository.findNearby({
      lat: query.lat,
      lon: query.lon,
      radiusMeters: query.radius,
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  async findOne(id: string): Promise<Gist | null> {
    return this.gistRepository.findByGistId(id);
  }
}
