"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { YellowGlowBackground } from "@/components/ui/background-components";
import { AnalyzerForm } from "@/components/analyzer-form";
import { ResultsPanel } from "@/components/results-panel";
import type { AnalysisResult } from "@/types/analysis";

type PreviewState = {
  referencePreview: string | null;
  targetPreview: string | null;
};

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previews, setPreviews] = useState<PreviewState>({
    referencePreview: null,
    targetPreview: null,
  });

  return (
    <YellowGlowBackground>
      {/* Hero */}
      <div className="flex min-h-[44vh] flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Farbe
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Color matching for design work.
          </h1>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Upload a reference and a target. Get palette, score, and findings.
          </p>
        </motion.div>
      </div>

      {/* Upload + results */}
      <div className="mx-auto max-w-5xl px-4 pb-20 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <AnalyzerForm
            onResult={(nextResult, nextPreviews) => {
              setResult(nextResult);
              setPreviews(nextPreviews);
            }}
          />
        </div>

        {result ? (
          <div className="mt-8">
            <ResultsPanel previews={previews} result={result} />
          </div>
        ) : null}
      </div>
    </YellowGlowBackground>
  );
}
