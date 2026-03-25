import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { GistsModule } from './gists/gists.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, GistsModule],
})
export class AppModule {}
