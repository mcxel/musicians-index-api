# Health System

This directory contains self-healing and diagnostic configuration for the BerntoutGlobal XXL platform.

## Files

- `module-status.json` - Module health tracking
- `failure-types.json` - Failure classification with severity classes (A-D)
- `severity-levels.json` - Severity level definitions
- `self-heal-actions.json` - Auto-fix actions
- `verification-checks.json` - Post-fix validation checks

## Classification

| Class | Name | Risk | Auto-Fix |
|-------|------|------|----------|
| A | Cosmetic | Low | Yes |
| B | Experience | Medium | Propose |
| C | Business | High | No |
| D | Critical | Critical | No |
