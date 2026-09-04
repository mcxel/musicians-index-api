# TMI Autonomous Asset Foundry — Phase 1

## Foundry Proof 001 — Zero-External-Mesh

Goal: manufacture one canonical bobblehead avatar and one minimum viable Monday Night Stage from code and intent, with no externally supplied 3D mesh.

### Coordinate law
- Blender authoring: Z-up.
- 1 Blender unit = 1 meter.
- Runtime forward: -Y.
- glTF/GLB export: standard glTF Y-up conversion by Blender exporter.
- Do not rotate the canonical authoring armature to Y-up.

### Blender entry points

Avatar:
```bash
blender --background --python scripts/blender/manufactureAvatar.py -- --intent packages/assets/src/manufacturing/intents/foundry-proof-001-avatar.intent.json
```

Venue:
```bash
blender --background --python scripts/blender/manufactureVenue.py -- --intent packages/assets/src/manufacturing/intents/foundry-proof-001-venue.intent.json
```

### Persistence
Generated job JSON belongs under:
`packages/assets/generated/manufacturing/jobs/`

Artifacts belong under:
`packages/assets/generated/manufacturing/artifacts/<jobId>/`

### Important truth rules
- A named ARKit target with zero vertex deformation is a failure.
- A Blender export is not certification.
- Reference images/videos are not production geometry.
- No externally supplied mesh is permitted for Foundry Proof 001.
- Runtime certification remains separate from manufacturing certification.
