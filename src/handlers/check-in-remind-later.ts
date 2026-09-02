import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { habit } from "../habits.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^check_in:remind_later(?::(\d+):(.+))?$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const h = habit(ctx, ctx.match[1]);
  if (!h) return void await ctx.reply("That reminder is no longer available. Open My habits to check in.");
  await ctx.reply(`Okay — I’ll nudge you again in 15 minutes for ${h.title}.`);
});

export default composer;
