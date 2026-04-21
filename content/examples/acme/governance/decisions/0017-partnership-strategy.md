---
id: governance/decisions/0017-partnership-strategy
status: accepted
date: "2025-12-01"
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
  estimated_cost: 20000
  currency: USD
  recurring: true
risk_level: low
review_date: "2026-06-01"
supersedes: []
---

# Integration Marketplace Strategy

## Problem Statement

Customers use 10-30 tools. Acme must integrate with these tools to automate cross-tool workflows. Building integrations is engineering-intensive.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Build an integration marketplace with a partner SDK. Priority integrations built in-house: Slack, GitHub, Notion, Google Workspace, Jira. Community-built integrations for long-tail tools. Revenue share model for marketplace partners.

## Reasoning

The integration marketplace creates a network effect: more integrations attract more customers, which attract more integration partners. In-house integrations for the top 5 tools cover 80% of customer needs. The partner SDK and revenue share model incentivize third-party development for the remaining 20%.
