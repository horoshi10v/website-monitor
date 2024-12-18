import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';
import { Website, WebsiteSchema } from './websites.schema';
import {Setting, SettingSchema} from "./settings.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: Website.name, schema: WebsiteSchema },
      { name: Setting.name, schema: SettingSchema },
    ]),
  ],
  controllers: [WebsitesController],
  providers: [WebsitesService],
})
export class WebsitesModule {}