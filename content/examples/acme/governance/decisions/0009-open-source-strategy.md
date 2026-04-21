---
id: governance/decisions/0009-open-source-strategy
status: accepted
date: "2025-09-15"
decision_makers:
  - Sarah Kim
  - Alex Chen
consulted:
  - Engineering Team
informed:
  - All Hands
pillars:
  - product
  - market
financial_impact:
  estimated_cost: 0
  currency: USD
  recurring: false
risk_level: medium
review_date: "2026-09-15"
supersedes: []
---

# Open Core Model

## Problem Statement

Decide whether to open-source any part of the Acme Platform. Open source can drive adoption but creates monetization challenges.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Adopt an open core model. Open-source the workflow engine SDK and basic automation primitives. Keep AI-powered templates, enterprise features (SSO, audit logs), and the hosted platform proprietary.

## Reasoning

Open-sourcing the SDK creates developer mindshare and community contributions. The proprietary AI templates and enterprise features provide clear monetization boundaries. Open core companies (GitLab, Elastic, DataVault) have demonstrated this model scales effectively. The SDK attracts technical evaluators who later convert to paid hosted plans.
