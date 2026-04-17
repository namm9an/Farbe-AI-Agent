import type { AnalysisResult, ColorMatch, ExtractedColor, RGB } from "@/types/analysis";

type Lab = {
  l: number;
  a: number;
  b: number;
};

const pivotRgb = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

const rgbToLab = ({ r, g, b }: RGB): Lab => {
  const rr = pivotRgb(r);
  const gg = pivotRgb(g);
  const bb = pivotRgb(b);

  const x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  const y = rr * 0.2126 + gg * 0.7152 + bb * 0.0722;
  const z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;

  const pivotX = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
  const pivotY = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
  const pivotZ = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;

  return {
    l: 116 * pivotY - 16,
    a: 500 * (pivotX - pivotY),
    b: 200 * (pivotY - pivotZ),
  };
};

const deltaE = (left: RGB, right: RGB) => {
  const a = rgbToLab(left);
  const b = rgbToLab(right);

  return Math.sqrt((a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
};

const computeMatches = (
  referencePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
): ColorMatch[] =>
  referencePalette.map((reference) => {
    const rankedTargets = targetPalette
      .map((target) => ({
        target,
        distance: deltaE(reference.rgb, target.rgb),
      }))
      .sort((left, right) => left.distance - right.distance);

    const closest = rankedTargets[0];

    return {
      reference,
      target: closest?.target ?? null,
      distance: Number((closest?.distance ?? 100).toFixed(2)),
    };
  });

const getScore = (matches: ColorMatch[]) => {
  if (matches.length === 0) {
    return 0;
  }

  const weightedDistance = matches.reduce(
    (sum, match) => sum + match.distance * Math.max(match.reference.weight, 0.08),
    0,
  );

  const score = Math.max(0, Math.min(100, 100 - weightedDistance * 1.1));
  return Math.round(score);
};

const buildFindings = (matches: ColorMatch[], score: number) => {
  const findings: string[] = [];
  const primaryMatch = matches[0];

  if (score >= 85) {
    findings.push("The target design is strongly aligned with the reference palette overall.");
  } else if (score >= 70) {
    findings.push("The target design is reasonably close, but a few key tones have drifted away from the reference.");
  } else if (score >= 50) {
    findings.push("The target design only partially matches the reference and needs visible palette correction.");
  } else {
    findings.push("The target design is materially off-brand relative to the reference palette.");
  }

  if (primaryMatch && primaryMatch.distance > 18) {
    findings.push(
      `The dominant reference color ${primaryMatch.reference.hex} is not landing cleanly in the target design.`,
    );
  }

  const weakMatches = matches.filter((match) => match.distance > 22);
  if (weakMatches.length >= 2) {
    findings.push("More than one major reference tone is missing or too far from the intended brand direction.");
  }

  const neutralMissing = matches.some(
    (match) => match.reference.role === "neutral" && match.distance > 20,
  );
  if (neutralMissing) {
    findings.push("Supporting neutrals are shifting enough to affect the overall balance of the design.");
  }

  return findings;
};

const buildSuggestions = (matches: ColorMatch[]) => {
  const suggestions: string[] = [];
  const primaryMatch = matches[0];

  if (primaryMatch?.target && primaryMatch.distance > 10) {
    suggestions.push(
      `Replace the current lead tone with something closer to ${primaryMatch.reference.hex} to anchor the brand more accurately.`,
    );
  }

  const accentMismatches = matches.filter(
    (match) => match.reference.role === "accent" && match.distance > 16,
  );
  if (accentMismatches.length > 0) {
    suggestions.push("Tighten the accent colors before adjusting the rest of the composition.");
  }

  suggestions.push("Use the extracted reference palette as the source of truth before making layout refinements.");
  suggestions.push("If the design still feels off after the palette correction, review spacing and alignment second.");

  return suggestions;
};

export const comparePalettes = (
  referencePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
  confidence: number,
): Pick<AnalysisResult, "colorMatchScore" | "findings" | "suggestions" | "matches" | "summary" | "confidence"> => {
  const matches = computeMatches(referencePalette, targetPalette);
  const colorMatchScore = getScore(matches);
  const findings = buildFindings(matches, colorMatchScore);
  const suggestions = buildSuggestions(matches);

  return {
    colorMatchScore,
    findings,
    suggestions,
    matches,
    confidence,
    summary:
      colorMatchScore >= 75
        ? "The design is directionally aligned, with some room to tighten the palette."
        : "The design needs palette correction before it will feel properly aligned with the reference.",
  };
};
