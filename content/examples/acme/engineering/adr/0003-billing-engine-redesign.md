# ADR-0003: Billing Engine Redesign — Idempotent Async Handler

**Status:** Accepted  
**Date:** 2026-03-15  
**Owner:** people/team/raj-patel  
**Supersedes:** —

## Problem

The synchronous Stripe webhook handler (see engineering/tech-debt/legacy-
webhook-handler) causes duplicate subscription mutations and revenue
reconciliation errors. A redesign is required before scaling beyond
500 paying accounts.

## Options Considered

1. **Add idempotency key to existing synchronous handler** — minimal change,
   reduces duplicates but retains reliability risk under load spikes.
2. **Async handler via existing Inngest job queue** — reuses ADR-0002
   infrastructure; Stripe event ID as idempotency key; dead-letter queue
   with alerting.
3. **Third-party billing platform (Lago, Orb)** — full replacement; higher
   capability but 3-6 month migration timeline and vendor lock-in.

## Decision

Option 2: async Inngest handler with Stripe event ID idempotency.

## Reasoning

- Reuses existing job queue infrastructure (ADR-0002); no new dependencies.
- Stripe event ID as idempotency key is the canonical Stripe-recommended
  approach; eliminates duplicate mutations at the source.
- Dead-letter queue with PagerDuty alert gives runbook-driven manual
  resolution path for the rare event of webhook delivery failures.
- Migration via feature flag (engineering/flags/new-billing-engine) allows
  parallel run and instant rollback.

## Trade-offs

- Still coupled to Stripe's event model; future payment provider switch
  requires handler rewrite (acceptable: Stripe dependency is intentional
  per governance/decisions/0004-pricing-model).

## References

- engineering/tech-debt/legacy-webhook-handler
- engineering/flags/new-billing-engine
- engineering/adr/0002-event-driven-workflow-execution
- vendors/stripe
