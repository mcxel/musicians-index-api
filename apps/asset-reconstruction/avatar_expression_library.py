"""
avatar_expression_library.py
FACS-based expression system for TMI avatars.
Defines action units, expression blends, and a matching library.
No rendering — output is numeric AU weights and blend coefficients.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)


# ─── FACS Action Units ────────────────────────────────────────────────────────

class ActionUnit(str, Enum):
    """Subset of FACS AUs relevant to TMI avatar expressivity."""
    # Upper face
    AU01_INNER_BROW_RAISE  = "AU01"   # concern, sadness, surprise
    AU02_OUTER_BROW_RAISE  = "AU02"   # surprise
    AU04_BROW_LOWERER      = "AU04"   # anger, focus
    AU05_UPPER_LID_RAISER  = "AU05"   # surprise, fear
    AU06_CHEEK_RAISER      = "AU06"   # duchenne smile marker
    AU07_LID_TIGHTENER     = "AU07"   # anger, disgust
    # Nose
    AU09_NOSE_WRINKLER     = "AU09"   # disgust
    # Mouth
    AU10_UPPER_LIP_RAISER  = "AU10"   # disgust, contempt
    AU12_LIP_CORNER_PULLER = "AU12"   # smile
    AU15_LIP_CORNER_DEPR   = "AU15"   # sadness
    AU17_CHIN_RAISER       = "AU17"   # doubt
    AU20_LIP_STRETCHER     = "AU20"   # fear
    AU23_LIP_TIGHTENER     = "AU23"   # anger
    AU24_LIP_PRESSOR       = "AU24"   # anger, determination
    AU25_LIPS_PART         = "AU25"   # speech, surprise
    AU26_JAW_DROP          = "AU26"   # surprise, awe
    AU28_LIP_SUCK          = "AU28"   # contempt
    # Head
    AU51_HEAD_TURN_LEFT    = "AU51"
    AU52_HEAD_TURN_RIGHT   = "AU52"
    AU53_HEAD_UP           = "AU53"
    AU54_HEAD_DOWN         = "AU54"
    AU55_HEAD_TILT_LEFT    = "AU55"
    AU56_HEAD_TILT_RIGHT   = "AU56"
    # Eye
    AU43_EYES_CLOSED       = "AU43"
    AU45_BLINK             = "AU45"
    AU46_WINK              = "AU46"


class ExpressionType(str, Enum):
    NEUTRAL     = "neutral"
    HAPPY       = "happy"
    EXCITED     = "excited"
    PROUD       = "proud"
    HYPE        = "hype"           # crowd-energy expression
    FOCUSED     = "focused"
    SURPRISED   = "surprised"
    FEARFUL     = "fearful"
    SAD         = "sad"
    ANGRY       = "angry"
    DISGUSTED   = "disgusted"
    CONTEMPT    = "contempt"
    CONFUSED    = "confused"
    DETERMINED  = "determined"
    VICTORIOUS  = "victorious"
    DEFEATED    = "defeated"
    CUSTOM      = "custom"


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class AUWeight:
    unit: str          # ActionUnit enum value
    intensity: float   # 0.0 = absent, 1.0 = maximum

    def __post_init__(self):
        self.intensity = float(np.clip(self.intensity, 0.0, 1.0))


@dataclass
class AvatarExpression:
    expression_id: str
    name: str
    expression_type: ExpressionType
    au_weights: list[AUWeight]
    description: str = ""
    tags: list[str] = field(default_factory=list)
    valence: float = 0.0       # -1 (negative) to +1 (positive)
    arousal: float = 0.0       # -1 (calm) to +1 (activated)

    def to_au_vector(self) -> np.ndarray:
        """Returns a fixed-length AU vector indexed by ActionUnit enum order."""
        all_units = [au.value for au in ActionUnit]
        vec = np.zeros(len(all_units), dtype=np.float32)
        unit_index = {u: i for i, u in enumerate(all_units)}
        for w in self.au_weights:
            if w.unit in unit_index:
                vec[unit_index[w.unit]] = w.intensity
        return vec

    def get_au(self, unit: ActionUnit) -> float:
        for w in self.au_weights:
            if w.unit == unit.value:
                return w.intensity
        return 0.0

    def to_dict(self) -> dict:
        d = asdict(self)
        d["expression_type"] = self.expression_type.value
        return d

    @classmethod
    def from_dict(cls, data: dict) -> "AvatarExpression":
        data = dict(data)
        data["expression_type"] = ExpressionType(data["expression_type"])
        data["au_weights"] = [AUWeight(**w) for w in data["au_weights"]]
        return cls(**data)


@dataclass
class ExpressionBlend:
    expression_id: str
    name: str
    components: list[tuple[str, float]]  # (expression_id, weight)
    resolved: Optional[AvatarExpression] = None


@dataclass
class ExpressionMatchResult:
    expression: AvatarExpression
    similarity: float


# ─── Blending ─────────────────────────────────────────────────────────────────

def blend_expressions(
    expr_a: AvatarExpression,
    expr_b: AvatarExpression,
    t: float,
    blend_id: Optional[str] = None,
) -> AvatarExpression:
    """
    Linearly blend two expressions at parameter t ∈ [0, 1].
    t=0 → expr_a, t=1 → expr_b.
    """
    t = float(np.clip(t, 0.0, 1.0))
    all_units = {au.value for au in ActionUnit}

    map_a = {w.unit: w.intensity for w in expr_a.au_weights}
    map_b = {w.unit: w.intensity for w in expr_b.au_weights}

    blended: list[AUWeight] = []
    for unit in all_units:
        ia = map_a.get(unit, 0.0)
        ib = map_b.get(unit, 0.0)
        intensity = ia + t * (ib - ia)
        if intensity > 0.001:
            blended.append(AUWeight(unit=unit, intensity=intensity))

    valence = expr_a.valence + t * (expr_b.valence - expr_a.valence)
    arousal = expr_a.arousal + t * (expr_b.arousal - expr_a.arousal)

    return AvatarExpression(
        expression_id=blend_id or f"{expr_a.expression_id}_{expr_b.expression_id}_t{t:.2f}",
        name=f"{expr_a.name} → {expr_b.name} ({t:.0%})",
        expression_type=ExpressionType.CUSTOM,
        au_weights=blended,
        valence=round(valence, 4),
        arousal=round(arousal, 4),
    )


def additive_blend(expressions: list[tuple[AvatarExpression, float]]) -> AvatarExpression:
    """
    Weighted additive blend of N expressions.
    Each entry is (expression, weight). Weights are normalized.
    """
    total_w = sum(w for _, w in expressions)
    if total_w < 1e-8:
        raise ValueError("Total blend weight is zero")

    all_units = {au.value for au in ActionUnit}
    merged: dict[str, float] = {u: 0.0 for u in all_units}
    valence = 0.0
    arousal = 0.0

    for expr, w in expressions:
        norm_w = w / total_w
        for au_w in expr.au_weights:
            merged[au_w.unit] = min(1.0, merged.get(au_w.unit, 0.0) + au_w.intensity * norm_w)
        valence += expr.valence * norm_w
        arousal += expr.arousal * norm_w

    blended = [AUWeight(unit=u, intensity=v) for u, v in merged.items() if v > 0.001]
    return AvatarExpression(
        expression_id="additive_blend",
        name="Additive Blend",
        expression_type=ExpressionType.CUSTOM,
        au_weights=blended,
        valence=round(valence, 4),
        arousal=round(arousal, 4),
    )


# ─── Library ──────────────────────────────────────────────────────────────────

class AvatarExpressionLibrary:
    """
    Registry of named avatar expressions with cosine-similarity matching
    and JSON persistence.
    """

    def __init__(self):
        self._expressions: dict[str, AvatarExpression] = {}
        self._seed_canonical_expressions()

    # ── Registration ─────────────────────────────────────────────────────────

    def register(self, expression: AvatarExpression) -> None:
        self._expressions[expression.expression_id] = expression
        logger.debug("Registered expression '%s' [%s]", expression.name, expression.expression_type.value)

    def unregister(self, expression_id: str) -> None:
        self._expressions.pop(expression_id, None)

    def get(self, expression_id: str) -> Optional[AvatarExpression]:
        return self._expressions.get(expression_id)

    def by_type(self, expression_type: ExpressionType) -> list[AvatarExpression]:
        return [e for e in self._expressions.values() if e.expression_type == expression_type]

    def all_expressions(self) -> list[AvatarExpression]:
        return list(self._expressions.values())

    # ── Matching ─────────────────────────────────────────────────────────────

    def match_au_vector(
        self,
        au_vector: np.ndarray,
        top_k: int = 3,
    ) -> list[ExpressionMatchResult]:
        q_norm = np.linalg.norm(au_vector)
        if q_norm < 1e-8:
            return []

        results: list[ExpressionMatchResult] = []
        for expr in self._expressions.values():
            lib_vec  = expr.to_au_vector()
            min_len  = min(len(au_vector), len(lib_vec))
            sim      = float(np.dot(au_vector[:min_len], lib_vec[:min_len]) / (q_norm * np.linalg.norm(lib_vec[:min_len]) + 1e-8))
            results.append(ExpressionMatchResult(expression=expr, similarity=round(sim, 5)))

        results.sort(key=lambda r: r.similarity, reverse=True)
        return results[:top_k]

    def match_valence_arousal(
        self,
        valence: float,
        arousal: float,
        top_k: int = 3,
    ) -> list[ExpressionMatchResult]:
        query = np.array([valence, arousal], dtype=np.float32)
        results: list[ExpressionMatchResult] = []
        for expr in self._expressions.values():
            lib_va = np.array([expr.valence, expr.arousal], dtype=np.float32)
            dist   = float(np.linalg.norm(query - lib_va))
            sim    = 1.0 / (1.0 + dist)
            results.append(ExpressionMatchResult(expression=expr, similarity=round(sim, 5)))
        results.sort(key=lambda r: r.similarity, reverse=True)
        return results[:top_k]

    # ── Blend helpers ─────────────────────────────────────────────────────────

    def blend(
        self,
        id_a: str,
        id_b: str,
        t: float,
        blend_id: Optional[str] = None,
    ) -> AvatarExpression:
        expr_a = self.get(id_a)
        expr_b = self.get(id_b)
        if not expr_a:
            raise KeyError(f"Expression '{id_a}' not in library")
        if not expr_b:
            raise KeyError(f"Expression '{id_b}' not in library")
        return blend_expressions(expr_a, expr_b, t, blend_id)

    def resolve_blend(self, blend: ExpressionBlend) -> AvatarExpression:
        exprs: list[tuple[AvatarExpression, float]] = []
        for expr_id, weight in blend.components:
            expr = self.get(expr_id)
            if not expr:
                raise KeyError(f"Blend component '{expr_id}' not in library")
            exprs.append((expr, weight))
        result = additive_blend(exprs)
        result.expression_id = blend.expression_id
        result.name          = blend.name
        blend.resolved       = result
        return result

    # ── Persistence ───────────────────────────────────────────────────────────

    def export(self, path: str | Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"expressions": [e.to_dict() for e in self._expressions.values()]}
        path.write_text(json.dumps(data, indent=2))
        logger.info("Exported %d expressions → %s", len(self._expressions), path)

    def import_from(self, path: str | Path) -> int:
        data   = json.loads(Path(path).read_text())
        loaded = 0
        for raw in data.get("expressions", []):
            expr = AvatarExpression.from_dict(raw)
            self._expressions[expr.expression_id] = expr
            loaded += 1
        logger.info("Imported %d expressions from %s", loaded, path)
        return loaded

    # ── Canonical expressions ─────────────────────────────────────────────────

    def _seed_canonical_expressions(self) -> None:
        seed: list[AvatarExpression] = [
            AvatarExpression(
                expression_id="neutral",
                name="Neutral",
                expression_type=ExpressionType.NEUTRAL,
                au_weights=[],
                valence=0.0, arousal=0.0,
                tags=["canonical"],
            ),
            AvatarExpression(
                expression_id="happy",
                name="Happy",
                expression_type=ExpressionType.HAPPY,
                au_weights=[
                    AUWeight(ActionUnit.AU06_CHEEK_RAISER.value, 0.75),
                    AUWeight(ActionUnit.AU12_LIP_CORNER_PULLER.value, 0.90),
                ],
                valence=0.8, arousal=0.4,
                tags=["canonical", "positive"],
            ),
            AvatarExpression(
                expression_id="excited",
                name="Excited",
                expression_type=ExpressionType.EXCITED,
                au_weights=[
                    AUWeight(ActionUnit.AU01_INNER_BROW_RAISE.value, 0.5),
                    AUWeight(ActionUnit.AU02_OUTER_BROW_RAISE.value, 0.6),
                    AUWeight(ActionUnit.AU05_UPPER_LID_RAISER.value, 0.7),
                    AUWeight(ActionUnit.AU06_CHEEK_RAISER.value, 0.8),
                    AUWeight(ActionUnit.AU12_LIP_CORNER_PULLER.value, 0.9),
                    AUWeight(ActionUnit.AU25_LIPS_PART.value, 0.5),
                    AUWeight(ActionUnit.AU26_JAW_DROP.value, 0.3),
                ],
                valence=0.9, arousal=0.9,
                tags=["canonical", "positive", "high-energy"],
            ),
            AvatarExpression(
                expression_id="hype",
                name="Hype",
                expression_type=ExpressionType.HYPE,
                au_weights=[
                    AUWeight(ActionUnit.AU02_OUTER_BROW_RAISE.value, 0.8),
                    AUWeight(ActionUnit.AU05_UPPER_LID_RAISER.value, 0.9),
                    AUWeight(ActionUnit.AU12_LIP_CORNER_PULLER.value, 1.0),
                    AUWeight(ActionUnit.AU25_LIPS_PART.value, 0.8),
                    AUWeight(ActionUnit.AU26_JAW_DROP.value, 0.6),
                    AUWeight(ActionUnit.AU06_CHEEK_RAISER.value, 0.9),
                ],
                valence=1.0, arousal=1.0,
                tags=["canonical", "crowd", "performance"],
            ),
            AvatarExpression(
                expression_id="focused",
                name="Focused",
                expression_type=ExpressionType.FOCUSED,
                au_weights=[
                    AUWeight(ActionUnit.AU04_BROW_LOWERER.value, 0.6),
                    AUWeight(ActionUnit.AU07_LID_TIGHTENER.value, 0.4),
                    AUWeight(ActionUnit.AU23_LIP_TIGHTENER.value, 0.3),
                ],
                valence=-0.1, arousal=0.3,
                tags=["canonical", "neutral-positive"],
            ),
            AvatarExpression(
                expression_id="victorious",
                name="Victorious",
                expression_type=ExpressionType.VICTORIOUS,
                au_weights=[
                    AUWeight(ActionUnit.AU02_OUTER_BROW_RAISE.value, 0.7),
                    AUWeight(ActionUnit.AU05_UPPER_LID_RAISER.value, 0.6),
                    AUWeight(ActionUnit.AU06_CHEEK_RAISER.value, 0.95),
                    AUWeight(ActionUnit.AU12_LIP_CORNER_PULLER.value, 1.0),
                    AUWeight(ActionUnit.AU25_LIPS_PART.value, 0.6),
                    AUWeight(ActionUnit.AU53_HEAD_UP.value, 0.4),
                ],
                valence=1.0, arousal=0.85,
                tags=["canonical", "battle", "win"],
            ),
            AvatarExpression(
                expression_id="defeated",
                name="Defeated",
                expression_type=ExpressionType.DEFEATED,
                au_weights=[
                    AUWeight(ActionUnit.AU01_INNER_BROW_RAISE.value, 0.8),
                    AUWeight(ActionUnit.AU04_BROW_LOWERER.value, 0.5),
                    AUWeight(ActionUnit.AU15_LIP_CORNER_DEPR.value, 0.7),
                    AUWeight(ActionUnit.AU17_CHIN_RAISER.value, 0.4),
                    AUWeight(ActionUnit.AU54_HEAD_DOWN.value, 0.5),
                ],
                valence=-0.8, arousal=-0.3,
                tags=["canonical", "battle", "loss"],
            ),
        ]
        for expr in seed:
            self._expressions[expr.expression_id] = expr
