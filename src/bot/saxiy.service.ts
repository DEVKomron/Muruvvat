import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Context } from "vm";
import { Markup } from "telegraf";
import { Bot } from "./models/bot.model";
import { Saxiy } from "./models/saxiy.model";

@Injectable()
export class SaxiyService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Saxiy) private readonly saxiyModel: typeof Saxiy
  ) {}

  async onSaxiy(ctx: Context) {
    try {
      const user_id = ctx.from.id;
      const botUser = await this.botModel.findByPk(user_id);
      if (!botUser) {
        ctx.reply("Iltimos /start orqali botni qayta ishga tushuring:", {
          ...Markup.keyboard([["/start"]]).resize(),
        });
      } else {
        const saxiy = await this.saxiyModel.findByPk(user_id);
        if (!saxiy) {
          const saxiy = await this.saxiyModel.create({
            user_id,
            last_state: "name",
          });
          await ctx.reply("Iltimos ismingizni kiriting:", {
            ...Markup.removeKeyboard(),
          });
        } else if (saxiy?.last_state == "name") {
          await ctx.reply("Iltimos ismingizni kiriting:", {
            ...Markup.removeKeyboard(),
          });
        } else if (saxiy.last_state == "phone_number") {
          await ctx.reply("Iltimos raqamingizni ulashing:", {
            ...Markup.keyboard([
              Markup.button.contactRequest("Raqamni ulashish📞"),
            ]),
          });
        } else if (saxiy.last_state == "location") {
          await ctx.replyWithHTML(
            "<b>Iltimos lokatsiyangizni jo'nating:</b>\n<i>kartadan topib yuborish tavsiya etiladi</i>",
            Markup.keyboard([
              [Markup.button.locationRequest("Hozir turgan joyingiz📍")],
            ]).resize()
          );
        } else {
          await ctx.replyWithHTML(
            "Bo'limlardan birini tanlashingiz mumkin:",
            Markup.keyboard([
              ["MURUVVAT QILISH", "SABIRLILARNI KO'RISH"],
              ["ADMIN BILAN BOG'LANISH", "SOZLAMALAR"],
              ["ASOSIY MENYU"],
            ])
          );
        }
      }
    } catch (error) {
      console.log("onSaxiy error:", error);
    }
  }
}
