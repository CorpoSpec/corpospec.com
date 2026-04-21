---
id: governance/decisions/0030-documentation-strategy
status: accepted
date: "2026-02-15"
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
review_date: "2026-08-15"
supersedes: []
---

# Docs-as-Code Approach

## Problem Statement

Product documentation must stay synchronized with product changes. Traditional wiki-based docs drift from reality. Engineering team does not maintain docs in a separate system.

## Considered Options

Multiple approaches were evaluated before reaching this decision.

## Decision

Docs-as-code. Documentation lives in the same repository as the product code. Written in Markdown. Deployed via static site generator (Docusaurus). Documentation changes require the same review process as code changes. API documentation auto-generated from OpenAPI specs.

## Reasoning

Co-locating documentation with code ensures they evolve together. Markdown is familiar to all engineers. Auto-generated API docs eliminate manual specification maintenance. The review process catches documentation regressions before they reach customers.
