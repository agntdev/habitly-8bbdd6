import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { habit } from "../habits.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^habit:edit(?::(\d+))?$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const h = habit(ctx, ctx.match[1]);
  if (!h) return void await ctx.reply("Choose a habit from My habits first.");
  ctx.session.draft = { editHabitId: h.id };
  await ctx.reply(`Edit ${h.title}. What would you like to change?`, { reply_markup: inlineKeyboard([[inlineButton("Title", `habit:edit_title:${h.id}`), inlineButton("Reminder time", `habit:edit_time:${h.id}`)], [inlineButton("Cadence", `habit:edit_cadence:${h.id}`)]]) });
});
composer.callbackQuery(/^habit:edit_(title|time|cadence):(\d+)$/, async (ctx) => { await ctx.answerCallbackQuery(); const what = ctx.match[1]; const id = ctx.match[2]; ctx.session.draft = { editHabitId: id }; if (what === "title") { ctx.session.step = "edit_title"; await ctx.reply("Send the new habit name."); } else if (what === "time") { ctx.session.step = "edit_time"; await ctx.reply("Send the new local time like 08:30."); } else { await ctx.reply("Choose the new cadence.", { reply_markup: inlineKeyboard([[inlineButton("Every day", `habit:set_cadence:daily:${id}`)], [inlineButton("Specific weekdays", `habit:set_cadence:weekdays:${id}`)], [inlineButton("N times a week", `habit:set_cadence:times:${id}`)]]) }); } });
composer.callbackQuery(/^habit:set_cadence:(daily|weekdays|times):(\d+)$/, async (ctx) => { await ctx.answerCallbackQuery(); const h = habit(ctx, ctx.match[2]); if (!h) return void await ctx.reply("That habit is no longer available."); if (ctx.match[1] === "daily") { h.cadence = { kind: "daily" }; await ctx.reply(`${h.title} is now set for every day.`); } else if (ctx.match[1] === "weekdays") { ctx.session.draft = { editHabitId: h.id }; ctx.session.step = "weekdays"; await ctx.reply("Send weekday numbers, like 1, 3, 5 for Monday, Wednesday, Friday."); } else { ctx.session.draft = { editHabitId: h.id }; ctx.session.step = "frequency"; await ctx.reply("How many times each week? Send a number from 1 to 7."); } });
composer.on("message:text", async (ctx, next) => { const id = ctx.session.draft?.editHabitId; const h = habit(ctx, id); if (!h) return next(); const text = ctx.message.text.trim(); if (ctx.session.step === "edit_title") { if (!text || text.length > 80) return void await ctx.reply("Keep the habit name between 1 and 80 characters."); h.title = text; ctx.session.step = undefined; await ctx.reply(`Your habit is now called ${text}.`); return; } if (ctx.session.step === "edit_time") { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) return void await ctx.reply("Use a 24-hour time like 08:30."); h.reminderTime = text; ctx.session.step = undefined; await ctx.reply(`I’ll remind you about ${h.title} at ${text}.`); return; } if (ctx.session.step === "weekdays") { const days = text.split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7); if (!days.length) return void await ctx.reply("Send weekday numbers, like 1, 3, 5 for Monday, Wednesday, Friday."); h.cadence = { kind: "weekdays", days: [...new Set(days)] }; ctx.session.step = undefined; await ctx.reply(`${h.title}’s cadence is updated.`); return; } if (ctx.session.step === "frequency") { const count = Number(text); if (!Number.isInteger(count) || count < 1 || count > 7) return void await ctx.reply("Choose a whole number from 1 to 7."); h.cadence = { kind: "times", count }; ctx.session.step = undefined; await ctx.reply(`${h.title} is now set for ${count} times a week.`); return; } return next(); });

export default composer;
