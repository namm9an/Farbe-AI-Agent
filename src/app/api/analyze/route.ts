import { NextResponse } from "next/server";

import { comparePalettes } from "@/lib/analysis/compare-palettes";
import { extractPalette, getPaletteConfidence } from "@/lib/analysis/color-extraction";
import { saveAnalysisRun } from "@/lib/db";
import { generateSuggestionNarrative } from "@/lib/llm/client";
import type { AnalysisResult } from "@/types/analysis";

const asBuffer = async (file: File) => Buffer.from(await file.arrayBuffer());

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const referenceFile = formData.get("reference") as File | null;
    const targetFile = formData.get("target") as File | null;

    if (!referenceFile || !targetFile) {
      return NextResponse.json(
        { error: "Both reference and target images are required." },
        { status: 400 },
      );
    }

    const [referencePalette, targetPalette] = await Promise.all([
      extractPalette(await asBuffer(referenceFile)),
      extractPalette(await asBuffer(targetFile)),
    ]);

    const confidence = Number(
      ((getPaletteConfidence(referencePalette) + getPaletteConfidence(targetPalette)) / 2).toFixed(2),
    );
    const analysisCore = comparePalettes(referencePalette, targetPalette, confidence);

    const llmNarrative = await generateSuggestionNarrative({
      referencePalette: referencePalette.map((color) => color.hex),
      targetPalette: targetPalette.map((color) => color.hex),
      score: analysisCore.colorMatchScore,
      findings: analysisCore.findings,
      suggestions: analysisCore.suggestions,
    });

    const createdAt = new Date().toISOString();
    const result: AnalysisResult = {
      referencePalette,
      targetPalette,
      colorMatchScore: analysisCore.colorMatchScore,
      findings: analysisCore.findings,
      suggestions: llmNarrative
        ? [...analysisCore.suggestions, llmNarrative]
        : analysisCore.suggestions,
      matches: analysisCore.matches,
      confidence: analysisCore.confidence,
      summary: llmNarrative ?? analysisCore.summary,
      createdAt,
    };

    saveAnalysisRun({
      createdAt,
      referenceName: referenceFile.name,
      targetName: targetFile.name,
      matchScore: result.colorMatchScore,
      confidence: result.confidence,
      findings: result.findings,
      suggestions: result.suggestions,
      summary: result.summary,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "The analysis failed. Please try again with cleaner image assets." },
      { status: 500 },
    );
  }
}
