# Product Requirements Document: Game Session Statistics

**Product:** Tic Tac Toe (CLI)  
**Feature:** Session win/loss/tie counter  
**Author:** BMad Master (generated)  
**Date:** 2026-02-09  
**Status:** Draft  
**Document output language:** English  

---

## 1. Overview

Add a simple in-session statistics counter to the existing Tic Tac Toe CLI game. At the end of each game, the player will see running totals for wins, losses, and ties for the current session. When the user chooses not to play again, a short session summary is displayed.

This feature is scoped to **in-memory, session-only** statistics (no persistence between runs).

---

## 2. Goals

- Give the player clear feedback on how they are doing across multiple games in one sitting.
- Keep implementation minimal and aligned with the current CLI experience.
- Avoid changing existing game logic or UX flow beyond displaying and updating counts.

---

## 3. Non-Goals

- Persisting statistics to disk or across sessions.
- Leaderboards, history, or replay.
- Any change to rules, board, or minimax logic.

---

## 4. User Stories

| ID   | Story                                                                 | Priority |
|------|-----------------------------------------------------------------------|----------|
| US-1 | As a player, I want to see my wins, losses, and ties so I know how I'm doing this session. | Must have |
| US-2 | As a player, I want to see a short session summary when I exit so I can remember my results. | Must have |

---

## 5. Functional Requirements

### 5.1 Display

- **FR-1** After each game ends (win/loss/tie), show the updated session totals before the "Play again? (y/n)" prompt.
- **FR-2** Display format: human-readable line(s), e.g. `Session: X wins, Y losses, Z ties` or equivalent.
- **FR-3** When the user answers "n" (or equivalent) to "Play again?", show a final session summary (same totals) before the goodbye message.

### 5.2 Counting

- **FR-4** Increment the correct counter once per finished game: one of wins (human), losses (computer wins), or ties.
- **FR-5** Counters apply only to the current process; no persistence required.

### 5.3 Behavior

- **FR-6** Statistics reset when the application is restarted.
- **FR-7** "Play again?" flow and all existing prompts/inputs remain unchanged except for the added display of stats.

---

## 6. Success Metrics

- Session totals are correct after 1, 2, and 5+ games (manual check).
- Summary is shown after each game and again on exit.
- No regression in existing gameplay or "Play again?" behavior.

---

## 7. Out of Scope

- Saving/loading stats to a file or database.
- Per-session timestamps or duration.
- Difficulty levels or other game variants.
- GUI or non-CLI changes.

---

## 8. Open Questions

- None for MVP. Optional later: add a "Reset stats" option during the session.

---

## 9. Appendix: Current Context

- **Codebase:** Single file `tic_tac_toe.py`; game loop in `main()` with "Play again? (y/n)" and recursive `main()` on "y".
- **Integration point:** After `winner` is determined and the result message is printed, update counters and display session stats; repeat summary when user chooses not to play again.
