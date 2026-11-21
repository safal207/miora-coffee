# Upstairs Family Events Lab — unapproved demonstration, 21 November 2026

**Status: internal prototype only. Not approved by the Miora owners. Not a real event listing or booking service.**

## Known versus proposed

Confirmed directly by the project proposer: **Miora has space on its second floor**.
The proposer wants to explore whether it could be used for family activities,
without representing this as an approved plan.

Not confirmed: the owners' consent, available dates, child-safe capacity,
stairs/accessibility, staff, supervision, licensing, permissible use,
formats, prices, admission arrangements, schedules, reservations, or
operational feasibility. Do not publish claims about those details.

We have **no verified second-floor photos**. In particular, the photos
showing the Miora ground-floor play town must not be presented as images
of upstairs facilities. The prototype deliberately uses the established
Miora colors and real logo instead of inventing upstairs imagery.

## Access and functionality

This is only available when explicitly opening:

- local dev: `http://127.0.0.1:8123/?preview=family-events&lang=ru`
- other locales: `lang=tr` or `lang=en`

Without the `preview=family-events` parameter, the component is hidden.
There is **no navigation link** from the public menu to the preview.

The stakeholder sees a clearly marked “CONCEPT ONLY · NOT APPROVED”
module with an adult-oriented question and three **hypothetical**
formats: creative workshop, family meet-up, family celebration.
Selecting a format shows its example description and another prominent
disclaimer that dates, services and commercial terms are not approved.

The answer changes only in ephemeral UI state in the current document:
no cookies, local storage, analytics, outbound requests, RSVP forms,
leads, marketing collection or signup. A link returns to the normal menu,
which still works.

## Safety/marketing guardrails

- No real events, timetables, prices, reservations, staff, limits or benefits.
- No promises about children's supervision or leaving children unattended.
- No child-directed purchase or incentive.
- Do not describe example formats as events already happening.
- After any actual approval, owners must independently authorize wording,
  timetable, customer contact, permissions and photo usage.

## Review and QA

- `npm test` verifies URL gating, all three unapproved concepts in TR/RU/EN
  and exclusion of payment/booking/collection logic.
- `tests/family-events-smoke.mjs` verifies public hidden state,
  preview visibility, interactive choices, language changes, mobile and
  desktop overflow, absence of forms/tracking, and unaffected menu/cart
  on TR390 / RU320 / EN1280.
- Chromium screenshots stored in GitHub Actions artifacts for a stakeholder
  demo, not published to the Miora website.

This implementation is stacked on Draft PR #37 (City Guide), which depends on
Draft PRs #36, #35, #34. Do not merge or publish without separate owner approval.
