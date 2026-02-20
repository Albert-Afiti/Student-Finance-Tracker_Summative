# Student Finance Tracker

A responsive, accessible, and modular web application for tracking personal finances as a student. Built with semantic HTML5, vanilla JavaScript, and responsive CSS — includes income tracking by source, savings goals, bill reminders, regex-powered search, currency switching, budget cap alerts, a 7-day spending chart, multi-period trend graphs, and a native DOMParser-powered HTML scraper.

---

## Project Structure

```
├── index.html
├── README.md
├── assets/
│   ├── seed.json
│   └── test.html
├── scripts/
│   ├── ui.js
│   ├── search.js
│   ├── state.js
│   ├── storage.js
│   └── validators.js
└── styles/
    └── main.css
```

---

## Live Demo
https://albert-afiti.github.io/Student-Finance-Tracker_Summative/
**GitHub Pages URL**:
https://github.com/Albert-Afiti/Student-Finance-Tracker_Summative.git
---

## Chosen Theme

**Student Budget Tracker** — Azure Blue (`#007BFF`), Growth Green (`#28A745`), and Alert Red (`#DC3545`) palette. Clean layout, clear typography, and intuitive navigation designed for students managing personal expenses on any device.

---

## Features

- Dashboard overview with total records, total spending, top category, and budget cap alerts
- Top-level financial overview cards: Total Balance, Monthly Income, Total Expenses, Net Savings
- Budget vs. Actual tracker with category progress bars and a doughnut summary chart
- 7-day spending bar chart and multi-period trend graphs (7 days, 30 days, 3 months) rendered with vanilla JS canvas
- Income tracking by source — Scholarship, Student Loan, Parents / Family, Part-time Work, Other — with full history log and localStorage persistence
- Savings goals with visual progress bars, target dates, and the ability to add new goals dynamically
- Bills and subscriptions tracker with Overdue, Due Soon, Paid, and Upcoming badge states
- Add / edit / delete records with inline validation
- Sort records by description (A–Z), amount, or date
- Regex-based live search with case-sensitivity toggle and match highlighting via `<mark>`
- Currency switching (USD, RWF, EUR, GHS) with fixed conversion rates
- Budget cap alerts with colour-coded visual feedback (on track / low / over budget)
- JSON import with schema validation and JSON export
- Persistent dark mode toggle (saved to `localStorage`)
- Quick-Add floating action button (FAB) for fast expense entry
- Native DOMParser HTML scraper — extracts headings, links, images, tables, and form fields

---

## Regex Catalog

| Pattern | Description | Example Match |
|--------|-------------|---------------|
| `^Food$` | Exact category match | `"Food"` only |
| `Lunch\|Dinner` | OR — either term | `"Lunch"` or `"Dinner"` |
| `(?i)transport` | Case-insensitive inline flag | `"Transport"` or `"transport"` |
| `\d{4}-\d{2}-\d{2}` | ISO date format | `"2025-10-17"` |
| `\w+@\w+\.\w+` | Basic email format | `"user@example.com"` |

> Tip — toggle **Case-insensitive** in the search bar for pattern-flag-free matching.

---

## Accessibility Notes

- Semantic HTML5 landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Proper heading hierarchy: `<h1>` → `<h2>` → `<h3>`
- ARIA labels on icon buttons, edit buttons, and delete buttons (`aria-label="Edit: Lunch at cafeteria"`)
- `aria-live` polite / assertive regions for budget status, income status, goal status, bill status, and regex match count
- `role="dialog"` and `aria-modal="true"` on the delete confirmation modal and quick-add drawer
- Skip-to-content link (`.skip-link`) that appears on keyboard focus
- High-contrast colour palette (red `#DC3545`, blue `#007BFF`, green `#28A745`) and full dark mode support
- Keyboard-navigable navigation, forms, modals, sort controls, and dashboard sub-tabs — `outline` always visible on focus

---

## How to Run Tests

Manual testing steps:

1. **Income Tracking**
   - Open the **Income** section and log an entry with a source, amount, and date
   - Confirm the matching source card updates its cumulative total and the Total Monthly Income banner reflects the new grand total
   - Confirm the **Monthly Income** card on the Dashboard also updates
   - Click **Remove** on a history entry and confirm it disappears and totals recalculate
   - Click **Clear All** and confirm all entries are wiped with a confirmation prompt

2. **Savings Goals**
   - Open the **Savings Goals** section and add a new goal with a name, target, saved amount, and target date
   - Confirm a new goal card appears with the correct progress bar percentage
   - Click **Remove** and confirm the card is deleted

3. **Bills & Subscriptions**
   - Open the **Bills** section and add a bill with a name, amount, due date, and frequency
   - Confirm the bill appears at the top of the list with the correct Overdue / Due Soon / Upcoming badge based on the due date

4. **Regex Search**
   - Open the **Records** section and type `Lunch|Dinner` into the search bar
   - Observe matching records highlighted with `<mark>` and a match count below the field
   - Enable **Case-insensitive** and retry with mixed-case patterns

5. **Import JSON**
   - Go to **Settings → Import**
   - Select `assets/seed.json` (10+ diverse records)
   - Click **Import & Validate** and confirm records appear on the Records page

6. **Export JSON**
   - Click **Export to JSON** and confirm the downloaded file matches all current records
   - Re-import the exported file to verify round-trip integrity

7. **Scraper Test**
   - Open the **Scraper** section and paste the contents of `assets/test.html`
   - Click **Run Scraper** and verify the JSON output contains `headings`, `links`, `images`, `tables`, and `formFields`

8. **Dark Mode**
   - Click the toggle button in the header and confirm the theme switches to dark
   - Refresh the page and confirm dark mode persists (stored in `localStorage`)

9. **Responsive Layout**
   - Resize the browser to 400 px, 768 px, and 1024 px
   - Confirm the stats grid, records grid, overview banner, income sources grid, goals grid, and import/export panel reflow correctly at each breakpoint

---

## seed.json Requirements

Located in `assets/seed.json` — includes:

- 10 or more records spread across all six categories (Food, Books, Transport, Entertainment, Fees, Other)
- Edge dates: `2020-01-01`, `2030-12-31`
- Edge amounts: `0.01`, `99999.99`
- Tricky description strings: `"Lunch @ Café"`, `"Rent (Jan)"`, `"Gift: "`

---

## Demo Video

[Unlisted YouTube link]
https://youtu.be/Il-AiDaNsIE?si=8bbvDzn9mweICLZv

## References & Code Inspirations

- [MDN Web Docs](https://developer.mozilla.org/) — JavaScript DOM methods (`DOMParser`, `FileReader`, `Blob`, `localStorage`, `canvas`), regex, and accessibility best practices
- [MDN — DOMParser API](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) — native HTML parsing used in the scraper (no jQuery required)
- [CSS Tricks](https://css-tricks.com/) — responsive layout patterns (CSS Grid, `auto-fill`/`minmax`) and dark mode via `data-theme`
- [Stack Overflow](https://stackoverflow.com/) — debugging patterns and modular IIFE module architecture inspiration
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) — accessibility standards for colour contrast, focus management, and ARIA live regions

> External references were used for learning and implementation guidance only.

---

*© 2026 Albert-Afiti | Frontend Web Dev Summative — C3*