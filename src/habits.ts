import type { Ctx, Cadence, CheckIn, Habit, HabitData } from "./bot.js";
import { inlineButton, inlineKeyboard } from "./toolkit/index.js";

/** One clock seam for every date decision in this feature. */
export const now = () => new Date();
export function data(ctx: Ctx): HabitData {
  return (ctx.session.habitData ??= { timezone: "UTC", habits: [], checkIns: [], nextId: 1 });
}
export function localDate(timezone: string, date = now()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function validTimezone(value: string): boolean { try { Intl.DateTimeFormat(undefined, { timeZone: value }); return true; } catch { return false; } }
export function cadenceText(c: Cadence): string {
  if (c.kind === "daily") return "Every day";
  if (c.kind === "times") return `${c.count} times a week`;
  return `Weekdays: ${c.days.map((d) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d - 1]).join(", ")}`;
}
export function createHabit(ctx: Ctx): Habit | undefined {
  const draft = ctx.session.draft;
  if (!draft?.title || !draft.cadence || !draft.time) return undefined;
  const store = data(ctx); const habit: Habit = { id: String(store.nextId++), title: draft.title, cadence: draft.cadence, reminderTime: draft.time, paused: false, createdAt: localDate(store.timezone) };
  store.habits.push(habit); ctx.session.draft = undefined; ctx.session.step = undefined; return habit;
}
export function habit(ctx: Ctx, id?: string): Habit | undefined { return data(ctx).habits.find((h) => h.id === id); }
export function occurrence(ctx: Ctx, h: Habit): string { return `${h.id}:${localDate(data(ctx).timezone)}`; }
export function metrics(ctx: Ctx, h: Habit) {
  const entries = data(ctx).checkIns.filter((x) => x.habitId === h.id);
  const done = entries.filter((x) => x.status === "done");
  const dates = new Set(done.map((x) => x.date)); let streak = 0; let cursor = new Date(now());
  for (;;) { const day = localDate(data(ctx).timezone, cursor); if (!dates.has(day)) break; streak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  let longest = 0, run = 0; for (const day of [...dates].sort()) { if (day) { run++; longest = Math.max(longest, run); } }
  return { done: done.length, rate: entries.length ? Math.round((done.length / entries.length) * 100) : 0, streak, longest };
}
export function miniCalendar(ctx: Ctx, h: Habit): string {
  const checks = data(ctx).checkIns.filter((c) => c.habitId === h.id); const today = new Date(now()); const out: string[] = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setUTCDate(d.getUTCDate() - i); const key = localDate(data(ctx).timezone, d); out.push(checks.some((c) => c.date === key && c.status === "done") ? "●" : checks.some((c) => c.date === key) ? "○" : "–"); }
  return out.join(" ");
}
export function reminderKeyboard(h: Habit, occurrenceId: string) { return inlineKeyboard([[inlineButton("Done", `check_in:done:${h.id}:${occurrenceId}`), inlineButton("Skip", `check_in:skip:${h.id}:${occurrenceId}`)], [inlineButton("Remind me later (15m)", `check_in:remind_later:${h.id}:${occurrenceId}`)]]); }
export function habitKeyboard(h: Habit) { return inlineKeyboard([[inlineButton(h.paused ? "Resume" : "Pause", `habit:pause:${h.id}`), inlineButton("Edit", `habit:edit:${h.id}`)]]); }
export function record(ctx: Ctx, h: Habit, status: CheckIn["status"], occurrenceId: string): boolean {
  const store = data(ctx); if (store.checkIns.some((c) => c.occurrence === occurrenceId)) return false;
  store.checkIns.push({ occurrence: occurrenceId, habitId: h.id, date: localDate(store.timezone), status }); return true;
}
