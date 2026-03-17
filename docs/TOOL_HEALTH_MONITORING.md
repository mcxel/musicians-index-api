# Tool Health Monitoring

## Overview

Tool Health Monitoring provides real-time visibility into the operational status of all external AI tools integrated with the platform. It enables proactive detection of issues before they impact bot operations.

## Monitoring Metrics

### Availability Metrics

- **Online/Offline Status**: Current availability of each tool
- **Uptime Percentage**: Historical availability over time
- **Last Health Check**: Timestamp of most recent check
- **Response Time**: Average and p99 response times

### Performance Metrics

- **Success Rate**: Percentage of successful requests
- **Error Rate**: Percentage of failed requests
- **Average Latency**: Average processing time
- **Queue Depth**: Pending requests count

### Cost Metrics

- **Daily Cost**: Cost accumulated today
- **Cost Trend**: Cost trend over time
- **Budget Remaining**: Available budget percentage

## Health Check Configuration

| Tool Category | Check Interval | Timeout | Retry Count |
|---------------|---------------|---------|-------------|
| video_generation | 60s | 30s | 3 |
| image_generation | 60s | 30s | 3 |
| avatar_animation | 30s | 20s | 2 |
| voice_generation | 30s | 20s | 2 |
| research | 120s | 15s | 2 |
| browser_automation | 60s | 45s | 3 |

## Health Status Levels

| Status | Description | Action |
|--------|-------------|--------|
| healthy | All metrics normal | None |
| degraded | Some metrics elevated | Monitor |
| unhealthy | Critical metrics exceeded | Fallback triggered |
| unknown | Unable to check health | Assume degraded |

## Alert Thresholds

- **Response Time**: Alert if >5000ms
- **Error Rate**: Alert if >5%
- **Uptime**: Alert if <99.5%
- **Cost**: Alert if >80% daily budget

## Connected Systems

- Tool Registry
- Fallback Handler
- Cost Control System
- Alert Manager
