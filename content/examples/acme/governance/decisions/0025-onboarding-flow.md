---
id: governance/decisions/0025-onboarding-flow
status: accepted
date: "2026-01-15"
decision_makers:
  - Alex Chen
consulted:
  - Sarah Kim
  - Engineering Team
informed:
  - All Hands
pillars:
  - product
financial_impact:
  estimated_cost: 0
  currency: USD
  recurring: false
risk_level: low
review_date: "2026-07-15"
supersedes: []
---

# Self-Serve Onboarding

## Problem Statement

60% of free tier signups never complete setup. The onboarding flow is the biggest lever for improving free-to-paid conversion.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Implement a guided self-serve onboarding flow. Three steps: (1) Connect first integration (Slack or email), (2) Deploy a pre-built workflow template, (3) See the first automated action within 10 minutes. Track time-to-value as a product metric.

## Reasoning

The current onboarding requires users to configure integrations, build workflows from scratch, and understand the automation model before seeing value. Reversing the order (value first, configuration second) using pre-built templates reduces time-to-value from 25 minutes to under 10 minutes. This directly improves free-to-paid conversion.
