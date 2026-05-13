# ADR-0001: PostgreSQL as Primary Operational Store

**Status:** Accepted  
**Date:** 2025-07-15  
**Owner:** people/team/sarah-kim  
**Supersedes:** —

## Problem

Acme needs a primary relational store for workflow definitions, account data,
trigger configurations, and execution history. The choice must support ACID
transactions, row-level security for multi-tenant isolation, and JSON
document storage for workflow step payloads.

## Options Considered

1. **PostgreSQL (AWS RDS)** — mature, full ACID, JSONB support, native RLS,
   strong ecosystem, managed via RDS.
2. **MySQL / Aurora MySQL** — broadly used but lacks native JSONB, weaker RLS
   story, JSON column support is limited.
3. **DynamoDB** — serverless scalability but no ACID joins, requires application-
   layer multi-tenancy enforcement, complex query patterns.

## Decision

PostgreSQL on AWS RDS Multi-AZ (us-east-1 primary, eu-central-1 replica).

## Reasoning

- JSONB columns store workflow step definitions without a separate document
  store, avoiding cross-store transactions.
- Row Level Security enforces tenant isolation at the database layer
  (defense-in-depth against application bugs).
- RDS Multi-AZ provides automated failover with <60s RPO.
- The engineering team has deep PostgreSQL expertise; no learning curve.

## Trade-offs

- Vertical scaling ceiling (mitigated by read replicas and RDS instance
  upgrade path).
- Not serverless; idle-capacity cost in low-traffic environments.

## References

- governance/decisions/0005-tech-stack
- governance/decisions/0018-security-framework
