---
id: governance/decisions/0031-performance-targets
status: accepted
date: "2026-02-15"
decision_makers:
  - Sarah Kim
consulted:
  - Engineering Team
informed:
  - Alex Chen
  - All Hands
pillars:
  - product
financial_impact:
  estimated_cost: 10000
  currency: USD
  recurring: true
risk_level: medium
review_date: "2026-08-15"
supersedes: []
---

# SLA Definitions

## Problem Statement

Enterprise customers require formal SLA commitments. Internal engineering needs performance targets to prioritize reliability work. Without defined SLAs, there is no objective measure of service quality.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Define three SLA tiers aligned with pricing tiers. Free/Starter: 99.5% uptime (best effort). Pro: 99.9% uptime with 24-hour support response. Enterprise: 99.95% uptime with 4-hour support response and service credits for SLA breaches. API latency target: p95 under 200ms for all tiers.

## Reasoning

Formal SLAs set clear expectations for customers and engineering. The tiered structure aligns service commitments with revenue. The 99.95% enterprise target is achievable with current infrastructure (AWS multi-AZ, database failover) and incentivizes proactive reliability investment. Service credits for breaches demonstrate commitment to accountability.
