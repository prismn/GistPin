import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { GistsService } from './gists.service';
import { CreateGistDto } from './dto/create-gist.dto';
import { QueryGistsDto } from './dto/query-gists.dto';

@Controller('gists')
export class GistsController {
  constructor(private readonly gistsService: GistsService) {}

  @Post()
  create(@Body() dto: CreateGistDto) {
    return this.gistsService.create(dto);
  }

  @Get()
  findNearby(@Query() query: QueryGistsDto) {
    return this.gistsService.findNearby(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gistsService.findOne(id);
  }
}
