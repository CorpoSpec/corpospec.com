---
id: governance/decisions/0022-mobile-strategy
status: accepted
date: "2026-01-01"
decision_makers:
  - Sarah Kim
  - Alex Chen
consulted:
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
review_date: "2026-07-01"
supersedes: []
---

# Mobile-Responsive Web First

## Problem Statement

Customers want to monitor and approve workflows from mobile devices. Acme must decide between native mobile apps, progressive web app, or responsive web.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Mobile-responsive web first. Optimize the web application for mobile browsers. Defer native iOS and Android apps until usage data confirms sufficient mobile demand (target: 20%+ of sessions from mobile).

## Reasoning

Native mobile development doubles the engineering surface area without validated demand. A responsive web app provides adequate mobile access for monitoring and approvals. PWA capabilities (push notifications, offline support) bridge the gap. Native apps become justified when mobile usage exceeds 20% of total sessions.
