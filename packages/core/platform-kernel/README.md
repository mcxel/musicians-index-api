# Platform Kernel - @berntout/core-platform-kernel

## Purpose
The Platform Kernel is the foundational core that holds the entire BerntoutGlobal XXL platform together. It provides the essential bootstrapping, dependency injection, and lifecycle management for all other engines and modules.

## Responsibilities
- Platform bootstrap and initialization
- Engine registry and lifecycle management
- Dependency injection container
- Configuration management
- Service discovery
- Shutdown and graceful degradation

## Inputs
- Platform configuration (JSON/YAML)
- Engine manifest files
- Environment variables
- Feature flags

## Outputs
- Initialized platform instance
- Engine registry
- Service container
- Configuration context

## Connected Modules
- All modules depend on platform-kernel for initialization
- Connected to all engine packages

## Connected Engines
- All engines are registered and managed through platform-kernel
- Event bus integration
- State engine integration

## Not Responsible For
- Business logic
- Scene management (scene-engine)
- Script execution (script-engine)
- User interface (ui-system)
- Bot management (bot configs)

## Architecture
```
┌─────────────────────────────────────────────────────┐
│                 Platform Kernel                       │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Engine    │  │   Config   │  │  Service    │  │
│  │  Registry   │  │  Manager   │  │  Container  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Lifecycle  │  │   Feature   │  │   Logger    │  │
│  │  Manager    │  │   Flags     │  │   Bridge    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
