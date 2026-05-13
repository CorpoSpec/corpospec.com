# ADR-0002: Event-Driven Workflow Execution via Job Queue

**Status:** Accepted  
**Date:** 2025-09-01  
**Owner:** people/team/sarah-kim  
**Supersedes:** —

## Problem

Workflow execution must be decoupled from the HTTP request path. Long-
running multi-step workflows (up to 50 steps, ~30s total) block connections
and cause timeout errors if executed synchronously.

## Options Considered

1. **Postgres-backed job queue (pg_boss / Inngest)** — leverages existing RDS
   infra, ACID-guaranteed job delivery, no new infrastructure.
2. **AWS SQS + Lambda** — scales to zero, managed, but introduces cold starts
   and requires Lambda concurrency limits tuning.
3. **Redis-backed queue (BullMQ)** — popular but adds Redis as a required
   infrastructure dependency with its own HA/persistence concerns.

## Decision

Postgres-backed job queue using Inngest (self-hosted on EC2).

## Reasoning

- Inngest provides durable execution with step-level checkpointing; partial
  execution state survives process crashes.
- Uses existing RDS cluster; no new stateful infrastructure.
- Fan-out, delays, and parallel steps are first-class primitives in Inngest's
  SDK — matching Acme's workflow execution model directly.
- Self-hosted removes Inngest Cloud spend and data-residency concerns for
  EU customers (eu-central-1 deployment).

## Trade-offs

- Inngest self-hosted requires operational ownership (upgrades, monitoring).
- Throughput bounded by RDS IOPS (mitigated by separate queue schema on
  dedicated RDS instance in the growth plan).

## References

- engineering/adr/0001-postgres-primary-store
- governance/decisions/0005-tech-stack
- governance/decisions/0003-product-architecture
