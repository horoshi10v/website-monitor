import { NestFactory } from '@nestjs/core';
import { WebsitesModule } from './websites/websites.module';
import * as process from "node:process";

async function bootstrap() {
  const app = await NestFactory.create(WebsitesModule);

  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: 'GET,POST',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
