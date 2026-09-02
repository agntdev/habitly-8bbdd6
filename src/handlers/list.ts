import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { data, habitKeyboard, metrics, miniCalendar } from "../habits.js";

registerMainMenuItem({ label: "My habits", data: "habits:list", order: 20 });
const composer = new Composer<Ctx>();

async function show(ctx: Ctx, edit = false) {
  const habits = data(ctx).habits;
  if (!habits.length) { const text = "No habits yet — tap New habit to create one."; if (edit) await ctx.editMessageText(text); else await ctx.reply(text); return; }
  const text = habits.map((h) => { const m = metrics(ctx, h); return `${h.title}${h.paused ? " (paused)" : ""}\n${m.streak}-day streak · best ${m.longest} · ${m.rate}% complete\nNext: ${h.paused ? "paused" : h.reminderTime + " " + data(ctx).timezone}\n${miniCalendar(ctx, h)}`; }).join("\n\n");
  const keys = inlineKeyboard(habits.flatMap((h) => habitKeyboard(h).inline_keyboard)); if (edit) await ctx.editMessageText(text, { reply_markup: keys }); else await ctx.reply(text, { reply_markup: keys });
}

composer.callbackQuery("habits:list", async (ctx) => { await ctx.answerCallbackQuery(); await show(ctx, true); });
composer.callbackQuery("habits:refresh", async (ctx) => { await ctx.answerCallbackQuery(); await show(ctx, true); });

export default composer;
