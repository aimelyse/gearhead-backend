// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AppConfig>) => {
        const dbUrl = configService.get<string>('app.dbUrl', { infer: true });

        // console.log(`🔗 Connecting to MongoDB: ${dbUrl}`);

        return {
          uri: dbUrl,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
