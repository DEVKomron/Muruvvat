import { Ctx, Hears, Update } from "nestjs-telegraf";
import { Context } from "vm";
import { SaxiyService } from "./saxiy.service";

@Update()
export class SaxiyUpdate {
  constructor(private readonly saxiyService: SaxiyService) {}

  @Hears("Saxiy")
  async onSaxiy(@Ctx() ctx: Context) {
    await this.saxiyService.onSaxiy(ctx);
  }
}
