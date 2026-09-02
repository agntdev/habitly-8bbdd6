import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { data, metrics, miniCalendar } from "../habits.js";

registerMainMenuItem({ label: "Weekly recap", data: "habits:report", order: 30 });
const composer = new Composer<Ctx>();

async function report(ctx: Ctx, edit = false) { const habits = data(ctx).habits; const text = habits.length ? `This week, you completed ${habits.reduce((n, h) => n + metrics(ctx, h).done, 0)} check-ins across ${habits.length} habit${habits.length === 1 ? "" : "s"}. Keep showing up — your progress matters.\n\n${habits.map((h) => `${h.title}: ${metrics(ctx, h).rate}% complete\n${miniCalendar(ctx, h)}`).join("\n\n")}` : "No weekly recap yet — create a habit and your progress will appear here."; if (edit) await ctx.editMessageText(text, { reply_markup: inlineKeyboard([[inlineButton("My habits", "habits:list")]]) }); else await ctx.reply(text); }

composer.callbackQuery("habits:report", async (ctx) => { await ctx.answerCallbackQuery(); await report(ctx, true); });

export default composer;
