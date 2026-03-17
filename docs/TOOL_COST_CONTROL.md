# Tool Cost Control

## Overview

Tool Cost Control manages and monitors the financial aspects of using external AI tools. It ensures operations stay within budget and provides alerts when costs approach limits.

## Cost Management Principles

### Budget Allocation

- Each bot family has a daily budget allocation
- Budgets are reset at midnight UTC
- Unused budget does not roll over

### Cost Tracking

- Real-time cost tracking per tool
- Per-operation cost calculation
- Cumulative cost aggregation by bot family

## Cost Limits

| Limit Type | Value | Description |
|-----------|-------|-------------|
| Daily Budget | $500.00 | Max per bot family per day |
| Per-Task Limit | $5.00 | Max cost per individual task |
| Hourly Limit | $50.00 | Max cost per hour per bot family |
| Overage Alert | 80% | Alert threshold |

## Cost Calculation

Cost factors:
- API call base cost
- Processing time multiplier
- Output size charges
- Premium feature surcharges

## Budget Enforcement

When budget is exceeded:
1. Block new tool requests
2. Queue requests for next budget period
3. Alert administrators
4. Log all blocked attempts

## Connected Systems

- Tool Registry
- Permission System
- Alert Manager
- Audit Logging
