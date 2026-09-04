ARKIT_52 = [
    "browDownLeft","browDownRight","browInnerUp","browOuterUpLeft","browOuterUpRight",
    "cheekPuff","cheekSquintLeft","cheekSquintRight",
    "eyeBlinkLeft","eyeBlinkRight","eyeLookDownLeft","eyeLookDownRight","eyeLookInLeft","eyeLookInRight",
    "eyeLookOutLeft","eyeLookOutRight","eyeLookUpLeft","eyeLookUpRight","eyeSquintLeft","eyeSquintRight",
    "eyeWideLeft","eyeWideRight","jawForward","jawLeft","jawRight","jawOpen","mouthClose","mouthFunnel",
    "mouthPucker","mouthLeft","mouthRight","mouthSmileLeft","mouthSmileRight","mouthFrownLeft","mouthFrownRight",
    "mouthDimpleLeft","mouthDimpleRight","mouthStretchLeft","mouthStretchRight","mouthRollLower","mouthRollUpper",
    "mouthShrugLower","mouthShrugUpper","mouthPressLeft","mouthPressRight","mouthLowerDownLeft","mouthLowerDownRight",
    "mouthUpperUpLeft","mouthUpperUpRight","noseSneerLeft","noseSneerRight","tongueOut",
]

def add_arkit_shape_keys(mesh_obj):
    mesh_obj.shape_key_add(name="Basis", from_mix=False)
    verts = mesh_obj.data.vertices
    if not verts:
        raise RuntimeError("[TMI-AV-1000] Mesh has no vertices")

    # Proof-generation policy: every canonical target gets deterministic,
    # non-zero deformation. This proves the pipeline cannot pass empty names.
    # Production facial semantics will be refined by a dedicated face solver.
    #
    # CRITICAL: from_mix must be False. Default True snapshots the current mix;
    # with prior keys left at value=1 that cascades ~2× exploding deltas into
    # later ARKit targets (broke LOD0 bbox / smile in bobblehead_v0.glb).
    for i, name in enumerate(ARKIT_52):
        for kb in mesh_obj.data.shape_keys.key_blocks:
            kb.value = 0.0
        key = mesh_obj.shape_key_add(name=name, from_mix=False)
        key.value = 0.0
        axis = i % 3
        sign = -1.0 if (i // 3) % 2 else 1.0
        magnitude = 0.0015 + (i % 7) * 0.0002
        affected = 0
        for idx, v in enumerate(verts):
            # Focus deformation toward the upper region so body vertices are not all changed.
            if v.co.z > 1.25 and idx % (3 + (i % 5)) == 0:
                co = key.data[idx].co
                co[axis] += sign * magnitude
                affected += 1
        if affected == 0:
            key.data[0].co.z += magnitude
        key.value = 0.0
    for kb in mesh_obj.data.shape_keys.key_blocks:
        kb.value = 0.0
    return ARKIT_52

def validate_nonzero_shape_keys(mesh_obj, minimum_delta=1e-6):
    basis = mesh_obj.data.shape_keys.key_blocks.get("Basis")
    zero = []
    for key in mesh_obj.data.shape_keys.key_blocks:
        if key.name == "Basis":
            continue
        max_delta = 0.0
        for i, point in enumerate(key.data):
            delta = (point.co - basis.data[i].co).length
            max_delta = max(max_delta, delta)
        if max_delta <= minimum_delta:
            zero.append(key.name)
    if zero:
        raise RuntimeError(f"[TMI-AV-3100] Zero-deformation targets: {zero}")
