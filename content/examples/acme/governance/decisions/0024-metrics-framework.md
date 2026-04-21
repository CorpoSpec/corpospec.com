---
id: governance/decisions/0024-metrics-framework
status: accepted
date: "2026-01-15"
decision_makers:
  - Alex Chen
  - Sarah Kim
consulted:
  - Engineering Team
informed:
  - All Hands
pillars:
  - metrics
  - governance
financial_impact:
  estimated_cost: 0
  currency: USD
  recurring: false
risk_level: low
review_date: "2026-07-15"
supersedes: []
---

# North Star Metric Definition

## Problem Statement

Acme needs a single north star metric that aligns the entire team. Too many metrics fragment focus. Too few metrics miss critical signals.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

North star metric: Weekly Active Workflows (WAW). A workflow is "active" if it executed at least once in the trailing 7 days. Supporting metrics: MRR, customer count, churn rate, NPS, and API uptime.

## Reasoning

WAW measures actual product value delivery. A growing WAW indicates customers are deriving ongoing value from automation. It correlates with retention (customers with 5+ active workflows have 95%+ retention). WAW is more meaningful than MAU because it measures value creation, not mere login activity.
