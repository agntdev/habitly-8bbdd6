import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { habit, record } from "../habits.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^check_in:skip(?::(\d+):(.+))?$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const h = habit(ctx, ctx.match[1]);
  if (!h) return void await ctx.reply("That reminder is no longer available. Open My habits to check in.");
  if (!record(ctx, h, "skipped", ctx.match[2])) return void await ctx.reply("You already checked in for this reminder.");
  await ctx.reply(`Skipped for today. Tomorrow is a fresh chance for ${h.title}.`);
});

export default composer;
