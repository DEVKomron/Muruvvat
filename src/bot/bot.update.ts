import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { BotService } from "./bot.service";
import { Action, Ctx, Hears, On, Start, Update } from "nestjs-telegraf";
import { Context } from "vm";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async Satart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Action(/^is_member__\d+$/)
  async isMember(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }
  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    await this.botService.onLocation(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}
