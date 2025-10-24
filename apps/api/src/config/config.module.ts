import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config) => {
        const parsed = configSchema.parse(config);
        return {
          ...parsed,
          SESSION_HEADER_NAME: parsed.SESSION_HEADER_NAME.toLowerCase()
        };
      }
    })
  ]
})
export class AppConfigModule {}
