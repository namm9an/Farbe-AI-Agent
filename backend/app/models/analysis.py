from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


class RGB(BaseModel):
    r: int
    g: int
    b: int


class ExtractedColor(BaseModel):
    hex: str
    rgb: RGB
    weight: float
    role: Literal["primary", "secondary", "accent", "neutral"]


class ColorMatch(BaseModel):
    reference: ExtractedColor
    target: ExtractedColor | None
    distance: float


class AnalysisResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    referencePalette: list[ExtractedColor]
    targetPalette: list[ExtractedColor]
    colorMatchScore: int
    findings: list[str]
    suggestions: list[str]
    matches: list[ColorMatch]
    confidence: float
    summary: str
    createdAt: str
