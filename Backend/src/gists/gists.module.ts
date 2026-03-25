import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gist } from './entities/gist.entity';
import { GistRepository } from './gist.repository';
import { GistsService } from './gists.service';
import { GistsController } from './gists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gist])],
  controllers: [GistsController],
  providers: [GistRepository, GistsService],
  exports: [GistsService],
})
export class GistsModule {}
