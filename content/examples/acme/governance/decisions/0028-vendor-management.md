---
id: governance/decisions/0028-vendor-management
status: accepted
date: "2026-02-01"
decision_makers:
  - Sarah Kim
consulted:
  - Engineering Team
informed:
  - Alex Chen
pillars:
  - legal
  - governance
financial_impact:
  estimated_cost: 0
  currency: USD
  recurring: false
risk_level: low
review_date: "2026-08-01"
supersedes: []
---

# Vendor Assessment Framework

## Problem Statement

Acme relies on 10+ third-party vendors (AWS, DataVault, NovaMind AI, Datadog, etc.). Each vendor introduces security, availability, and compliance risks. There is no systematic process for evaluating and monitoring vendors.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Implement a vendor assessment framework. Every vendor processing customer data must complete a security questionnaire. Annual review for critical vendors (infrastructure, AI providers). Quarterly review of vendor spend. DPAs required for all data processors.

## Reasoning

Systematic vendor management is a SOC 2 requirement (BDR 0008) and a GDPR requirement (BDR 0027). It also protects against vendor lock-in by maintaining awareness of alternatives. The framework is lightweight at 10 vendors but provides structure as the vendor count grows.
