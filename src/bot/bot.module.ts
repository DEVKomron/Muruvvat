import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { SequelizeModule } from "@nestjs/sequelize";
import { Bot } from "./models/bot.model";
import { SaxiyUpdate } from "./saxiy.update";
import { SaxiyService } from "./saxiy.service";
import { Saxiy } from "./models/saxiy.model";

@Module({
  imports: [SequelizeModule.forFeature([Bot, Saxiy])],
  providers: [SaxiyUpdate, SaxiyService, BotUpdate, BotService],
})
export class BotModule {}
