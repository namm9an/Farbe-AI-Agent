from __future__ import annotations

from math import sqrt

from app.models.analysis import ColorMatch, ExtractedColor, RGB


def pivot_rgb(value: int) -> float:
    channel = value / 255
    if channel <= 0.04045:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def rgb_to_lab(rgb: RGB) -> tuple[float, float, float]:
    rr = pivot_rgb(rgb.r)
    gg = pivot_rgb(rgb.g)
    bb = pivot_rgb(rgb.b)

    x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047
    y = rr * 0.2126 + gg * 0.7152 + bb * 0.0722
    z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883

    pivot_x = x ** (1 / 3) if x > 0.008856 else 7.787 * x + 16 / 116
    pivot_y = y ** (1 / 3) if y > 0.008856 else 7.787 * y + 16 / 116
    pivot_z = z ** (1 / 3) if z > 0.008856 else 7.787 * z + 16 / 116

    return (
        116 * pivot_y - 16,
        500 * (pivot_x - pivot_y),
        200 * (pivot_y - pivot_z),
    )


def delta_e(left: RGB, right: RGB) -> float:
    l1, a1, b1 = rgb_to_lab(left)
    l2, a2, b2 = rgb_to_lab(right)
    return sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)


def compute_matches(
    reference_palette: list[ExtractedColor],
    target_palette: list[ExtractedColor],
) -> list[ColorMatch]:
    matches: list[ColorMatch] = []
    for reference in reference_palette:
        ranked_targets = sorted(
            (
                {"target": target, "distance": delta_e(reference.rgb, target.rgb)}
                for target in target_palette
            ),
            key=lambda item: item["distance"],
        )
        closest = ranked_targets[0] if ranked_targets else None
        matches.append(
            ColorMatch(
                reference=reference,
                target=closest["target"] if closest else None,
                distance=round(closest["distance"], 2) if closest else 100,
            )
        )
    return matches


def get_score(matches: list[ColorMatch]) -> int:
    if not matches:
        return 0
    weighted_distance = sum(match.distance * max(match.reference.weight, 0.08) for match in matches)
    score = max(0, min(100, 100 - weighted_distance * 1.1))
    return round(score)


def build_findings(matches: list[ColorMatch], score: int) -> list[str]:
    findings: list[str] = []
    primary_match = matches[0] if matches else None

    if score >= 85:
        findings.append("The target design is strongly aligned with the reference palette overall.")
    elif score >= 70:
        findings.append("The target design is reasonably close, but a few key tones have drifted away from the reference.")
    elif score >= 50:
        findings.append("The target design only partially matches the reference and needs visible palette correction.")
    else:
        findings.append("The target design is materially off-brand relative to the reference palette.")

    if primary_match and primary_match.distance > 18:
        findings.append(
            f"The dominant reference color {primary_match.reference.hex} is not landing cleanly in the target design."
        )

    weak_matches = [match for match in matches if match.distance > 22]
    if len(weak_matches) >= 2:
        findings.append("More than one major reference tone is missing or too far from the intended brand direction.")

    neutral_missing = any(match.reference.role == "neutral" and match.distance > 20 for match in matches)
    if neutral_missing:
        findings.append("Supporting neutrals are shifting enough to affect the overall balance of the design.")

    return findings


def build_suggestions(matches: list[ColorMatch]) -> list[str]:
    suggestions: list[str] = []
    primary_match = matches[0] if matches else None

    if primary_match and primary_match.target and primary_match.distance > 10:
        suggestions.append(
            f"Replace the current lead tone with something closer to {primary_match.reference.hex} to anchor the brand more accurately."
        )

    accent_mismatches = [
        match for match in matches if match.reference.role == "accent" and match.distance > 16
    ]
    if accent_mismatches:
        suggestions.append("Tighten the accent colors before adjusting the rest of the composition.")

    suggestions.append("Use the extracted reference palette as the source of truth before making layout refinements.")
    suggestions.append("If the design still feels off after the palette correction, review spacing and alignment second.")

    return suggestions


def compare_palettes(
    reference_palette: list[ExtractedColor],
    target_palette: list[ExtractedColor],
    confidence: float,
) -> dict[str, object]:
    matches = compute_matches(reference_palette, target_palette)
    color_match_score = get_score(matches)
    findings = build_findings(matches, color_match_score)
    suggestions = build_suggestions(matches)

    return {
        "colorMatchScore": color_match_score,
        "findings": findings,
        "suggestions": suggestions,
        "matches": matches,
        "confidence": confidence,
        "summary": (
            "The design is directionally aligned, with some room to tighten the palette."
            if color_match_score >= 75
            else "The design needs palette correction before it will feel properly aligned with the reference."
        ),
    }
