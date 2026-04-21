---
id: governance/decisions/0004-pricing-model
status: accepted
date: "2025-07-15"
decision_makers:
  - Alex Chen
consulted:
  - Sarah Kim
  - Engineering Team
informed:
  - All Hands
pillars:
  - market
  - product
financial_impact:
  estimated_cost: 0
  currency: USD
  recurring: false
risk_level: medium
review_date: "2026-01-15"
supersedes: []
---

# Usage-Based Pricing Model

## Problem Statement

Acme must choose a pricing model that aligns value delivery with revenue capture. Options include per-seat, flat-rate, and usage-based pricing.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Adopt a freemium model with usage-based pricing for premium tiers. Free tier for small teams (up to 3 users, 100 workflow runs/month). Paid tiers scale with workflow run volume and AI feature usage.

## Reasoning

Usage-based pricing aligns revenue with customer value. Customers who derive more value pay more. The free tier reduces friction for initial adoption and enables product-led growth. Per-seat pricing would discourage broad team adoption, which is critical for workflow automation stickiness.
