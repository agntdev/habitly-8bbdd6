# Habit Tracker — Bot specification

**Archetype:** workflow

**Voice:** encouraging and concise — write every user-facing message, button label, error, and empty state in this voice.

A private Telegram bot that helps users track daily habits with local-time reminders, one-tap check-ins, and non-judgmental encouragement. Tracks streaks, completion metrics, and provides weekly recaps while maintaining full user privacy.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- individual users
- habit trackers
- productivity enthusiasts

## Success criteria

- User receives daily reminders at their local time
- Users can check in with one tap
- Streaks and metrics are accurately tracked and displayed
- Weekly recaps are sent with encouraging summaries

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu
- **/new** (command, actor: user, command: /new) — Start creating a new habit
- **/list** (command, actor: user, command: /list) — View all habits and their status
- **/report** (command, actor: user, command: /report) — View weekly recap and metrics
- **Done** (button, actor: user, callback: check_in:done) — Mark current reminder as done
  - inputs: habit_id, scheduled_occurrence_id
  - outputs: check-in status
- **Skip** (button, actor: user, callback: check_in:skip) — Mark current reminder as skipped
  - inputs: habit_id, scheduled_occurrence_id
  - outputs: check-in status
- **Remind me later (15m)** (button, actor: user, callback: check_in:remind_later) — Postpone current reminder by 15 minutes
  - inputs: habit_id, scheduled_occurrence_id
  - outputs: rescheduled reminder
- **Pause** (button, actor: user, callback: habit:pause) — Pause a selected habit
  - inputs: habit_id
  - outputs: habit status
- **Edit** (button, actor: user, callback: habit:edit) — Edit a selected habit
  - inputs: habit_id
  - outputs: updated habit

## Flows

### Onboarding
_Trigger:_ /start

1. Welcome message
2. Ask for timezone (optional)
3. Create first habit with title, cadence, and reminder time
4. Confirm habit details
5. Schedule first reminder

_Data touched:_ User, Habit

### Create Habit
_Trigger:_ /new

1. Prompt for habit title
2. Prompt for cadence (Every day / Specific weekdays / N times/week)
3. Prompt for reminder time
4. Show habit summary with Confirm/Cancel buttons
5. Save habit and schedule initial reminders

_Data touched:_ Habit

### Daily Reminder
_Trigger:_ scheduled_reminder

1. Send reminder message with Done/Skip/Remind later buttons
2. Record check-in status when user interacts
3. Reschedule postponed reminders if needed

_Data touched:_ Check-in, Streaks & metrics

### Weekly Recap
_Trigger:_ weekly_recap

1. Calculate weekly completion rate and streak changes
2. Generate encouraging summary with milestones and tips
3. Send recap message with metrics and mini-calendar

_Data touched:_ Streaks & metrics

### View Habits
_Trigger:_ /list

1. Display list of habits with current streak, longest streak, completion rate, next scheduled reminder, and mini-calendar

_Data touched:_ Habit, Streaks & metrics

### Edit Habit
_Trigger:_ habit:edit

1. Show habit details
2. Prompt for changes to title, cadence, time, or status
3. Update habit and reschedule reminders if needed

_Data touched:_ Habit

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User** _(retention: persistent)_ — User account with private data
  - fields: user_id, timezone, preferences
- **Habit** _(retention: persistent)_ — User-defined habit with tracking parameters
  - fields: habit_id, title, cadence, reminder_time, paused_flag
- **Check-in** _(retention: persistent)_ — User interaction with a scheduled habit occurrence
  - fields: check_in_id, date, status
- **Streaks & metrics** _(retention: persistent)_ — Computed habit performance statistics
  - fields: current_streak, longest_streak, completion_rate, total_completions

## Integrations

- **Telegram** (required) — Bot API messaging
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Notifications

- Daily reminders at user's local time
- Weekly recaps with encouraging summaries
- Non-intrusive milestone celebrations

## Permissions & privacy

- All user data is private and stored locally
- No social sharing or public visibility
- No admin access to user data

## Edge cases

- User changes timezone after habit creation
- User misses multiple reminders in a row
- User edits habit cadence mid-week
- User pauses and resumes a habit

## Required tests

- End-to-end test of habit creation and check-in flow
- Test timezone handling for reminders
- Verify weekly recap generation with different streak scenarios
- Test edge cases for habit editing and rescheduling

## Assumptions

- Users will want to track habits with consistent timing
- Most users will prefer local-time reminders
- Users will appreciate non-judgmental encouragement
- Users will want to maintain privacy for their habits
