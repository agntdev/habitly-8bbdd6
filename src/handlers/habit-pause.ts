import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { habit } from "../habits.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^habit:pause(?::(\d+))?$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const h = habit(ctx, ctx.match[1]);
  if (!h) return void await ctx.reply("Choose a habit from My habits first.");
  h.paused = !h.paused;
  await ctx.reply(h.paused ? `${h.title} is paused. Come back when it feels right.` : `${h.title} is active again. I’ll keep your reminder time.`);
});

export default composer;
