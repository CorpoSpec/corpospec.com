---
id: governance/decisions/0005-tech-stack
status: accepted
date: "2025-07-01"
decision_makers:
  - Sarah Kim
consulted:
  - Engineering Team
informed:
  - Alex Chen
pillars:
  - product
financial_impact:
  estimated_cost: 0
  currency: USD
  recurring: false
risk_level: low
review_date: "2026-07-01"
supersedes: []
---

# TypeScript / React / Node.js Stack

## Problem Statement

Choose the primary technology stack for the Acme Platform. The decision affects hiring, development velocity, and long-term maintainability.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

TypeScript across the full stack. React with Next.js for the frontend. Node.js with Express for the backend API. PostgreSQL for primary data store. Redis for caching and job queues.

## Reasoning

TypeScript provides type safety and shared code between frontend and backend. The React/Node ecosystem has the largest talent pool for hiring. PostgreSQL handles both relational and JSON data patterns required for workflow definitions. This stack is well-understood, well-documented, and has extensive library support.
