import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, mainMenuKeyboard } from "../toolkit/index.js";
import { data } from "../habits.js";

// The /start handler renders the bot's MAIN MENU — the primary way users operate
// a button-first bot. A feature adds its own button by calling
// `registerMainMenuItem(...)` in its own `src/handlers/<slug>.ts`; this handler
// renders whatever is registered (plus a Help button), so you do NOT edit this
// file to add a feature. Send ONE message — no placeholder line above the menu.
const composer = new Composer<Ctx>();

const WELCOME = "Welcome — small steps count. What would you like to do?";

composer.command("start", async (ctx) => {
  const store = data(ctx);
  if (store.habits.length === 0) {
    ctx.session.step = "timezone";
    await ctx.reply("Welcome — let’s make room for one small habit. Your timezone helps reminders arrive at the right local time.", { reply_markup: inlineKeyboard([[inlineButton("Use UTC", "timezone:UTC")], [inlineButton("Choose timezone", "timezone:choose")], [inlineButton("Skip for now", "timezone:UTC")]]) });
    return;
  }
  await ctx.reply(WELCOME, { reply_markup: mainMenuKeyboard() });
});

// "Back to menu" — re-render the main menu in place from any sub-view.
composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(WELCOME, { reply_markup: mainMenuKeyboard() });
});

export default composer;
