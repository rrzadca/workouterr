# Milestone 1a — Usable logger for me

Status: ready-for-agent

## Goal

I log every gym session in the app instead of writing notes. One account (mine), created with a CLI script, running
on MyDevil. English only, online only.

The full rules live in `project-scope.md`; this spec only says which parts belong to 1a. When a ticket and the
scope disagree, the scope wins and the ticket gets fixed.

## In 1a

- npm workspace: API (Express 5), Angular app, shared package (types, zod schemas, domain logic), UI library
  (Angular CDK + Tailwind, Storybook)
- Login and logout (session cookie, CSRF `Origin` check), `user:create` CLI script
- Exercises with muscle groups, starter set, archive and restore
- Routines with routine entries, rep ladders, limits, archive guards
- Live session: prefill, progression, increase pre-select, previous numbers, rest timer (end time, sound, Wake
  Lock), mid-session changes, saving swapped and extra exercises into the routine, one session in progress
- Whole-session `PUT` with client UUIDs and a version number (the same sync model 1b builds offline support on)
- Deployment to MyDevil (migrations from the Mac, see ADR-0001), nightly backups, cleanup cron
- Tests per the scope's Tests section; the deploy script runs them all

## Not in 1a

Offline storage and sync, training plans and rotation, Polish translations (keys only), registration, email flows,
rate limiting, session history, charts, records, export.

## Done when

I've logged a real gym session on the iPad with the deployed app (ticket 16).
