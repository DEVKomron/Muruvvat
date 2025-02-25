import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Context } from "vm";
import { Markup } from "telegraf";
import { Bot } from "./models/bot.model";
import { Saxiy } from "./models/saxiy.model";
import axios from "axios";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Saxiy) private readonly saxiyModel: typeof Saxiy
  ) {}

  async checkMembership(userId: number): Promise<boolean> {
    try {
      console.log(process.env.BOT_TOKEN);
      console.log(userId);

      const response = await axios.get(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
        {
          params: {
            chat_id: "@meaningful_lines",
            user_id: userId,
          },
          timeout: 10000, // 10 sekund timeout qo'shdim
        }
      );

      return ["member", "administrator", "creator"].includes(
        response.data.result.status
      );
    } catch (error) {
      console.error("Xatolik yuz berdi:", error.message);
      return false;
    }
  }

  async start(ctx: Context) {
    try {
      const user_id = ctx.from.id;

      const botUser = await this.botModel.findByPk(user_id);
      const isMember = await this.checkMembership(user_id);

      if (!botUser) {
        await this.botModel.create({
          user_id,
          user_name: ctx.from?.username,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          lang: ctx.from?.language_code,
          status: true,
        });
        if (!isMember) {
          return ctx.reply(`Botdan foydalanish uchun kanalga a'zo bo'ling:`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Ilm Sari",
                    url: `https://t.me/meaningful_lines`,
                  },
                ],
                [
                  {
                    text: "Tekshirish",
                    callback_data: `is_member__${user_id}`,
                  },
                ],
              ],
            },
          });
        }
        ctx.reply("Ro'yxatdan o'tish usulini tanlang: ", {
          ...Markup.keyboard([["Saxiy", "Sabirli"]]).resize(),
        });
      } else {
        if (!isMember) {
          return ctx.reply(`Botdan foydalanish uchun kanalga a'zo bo'ling:`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Satrlar",
                    url: `https://t.me/meaningful_lines`,
                  },
                ],
                [
                  {
                    text: "Tekshirish",
                    callback_data: `is_member__${user_id}`,
                  },
                ],
              ],
            },
          });
        }
        ctx.reply("Ro'yxatdan o'tish usulini tanlang: ", {
          ...Markup.keyboard([["Saxiy", "Sabirli"]]).resize(),
        });
        if (botUser && !botUser.status) {
          botUser.status = true;
          await botUser.save();
        }
      }
    } catch (error) {
      console.log("start error:", error);
    }
  }
  async onContact(ctx: Context) {
    try {
      if ("contact" in ctx.message!) {
        const user_id = ctx.from.id;
        const botUser = await this.botModel.findByPk(user_id);
        if (!botUser || !botUser.status) {
          ctx.reply("Iltimos /start orqali botni qayta ishga tushuring:", {
            ...Markup.keyboard([["/start"]]).resize(),
          });
        } else {
          const saxiy = await this.saxiyModel.findByPk(user_id);
          if (saxiy?.last_state == "phone_number") {
            saxiy.phone_number = ctx.message.contact.phone_number;
            saxiy.last_state = "location";
            await saxiy.save();

            await ctx.replyWithHTML(
              "<b>Iltimos lokatsiyangizni jo'nating:</b>\n<i>kartadan topib yuborish tavsiya etiladi</i>",
              Markup.keyboard([
                [Markup.button.locationRequest("Hozir turgan joyingiz📍")],
              ]).resize()
            );
          }
        }
      }
    } catch (error) {
      console.log("onContact error: ", error);
    }
  }
  async onText(ctx: Context) {
    try {
      if ("text" in ctx.message!) {
        const user_id = ctx.from.id;
        const botUser = await this.botModel.findByPk(user_id);
        if (!botUser || !botUser.status) {
          ctx.reply("Iltimos /start orqali botni qayta ishga tushuring:", {
            ...Markup.keyboard([["/start"]]).resize(),
          });
        } else {
          const saxiy = await this.saxiyModel.findByPk(user_id);
          if (saxiy?.last_state == "name") {
            saxiy.name = ctx.message.text;
            saxiy.last_state = "phone_number";
            await saxiy.save();

            await ctx.reply("Iltimos raqamingizni ulashing:", {
              ...Markup.keyboard([
                Markup.button.contactRequest("Raqamni ulashish📞"),
              ]).resize(),
            });
          }
        }
      }
    } catch (error) {
      console.log("onText error: ", error);
    }
  }
  async onLocation(ctx: Context) {
    try {
      if ("location" in ctx.message!) {
        const user_id = ctx.from?.id;
        const botUser = await this.botModel.findByPk(user_id);

        if (!botUser || !botUser.status) {
          await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
            parse_mode: "HTML",
            ...Markup.keyboard([["/start"]]).resize(),
          });
        } else {
          const saxiy = await this.saxiyModel.findByPk(user_id);
          if (saxiy?.last_state == "location") {
            saxiy.location = `${ctx.message.location.latitude},${ctx.message.location.longitude}`;
            saxiy.last_state = "finish";
            await saxiy.save();

            await ctx.replyWithHTML(
              "Bo'limlardan birini tanlashingiz mumkin:",
              Markup.keyboard([
                ["MURUVVAT QILISH", "SABIRLILARNI KO'RISH"],
                ["ADMIN BILAN BOG'LANISH", "SOZLAMALAR"],
                ["ASOSIY MENYU"],
              ]).resize()
            );
          }
        }
      }
    } catch (error) {
      console.log("OnLocationError: ", error);
    }
  }
}
