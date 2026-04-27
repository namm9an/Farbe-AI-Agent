"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { AuroraBackground } from "@/components/ui/aurora-background";
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
    <div className="min-h-screen dark bg-zinc-900">
      {/* Hero section — aurora covers exactly one viewport height */}
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center gap-4 px-6 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
            Farbe
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            Color matching for design work.
          </h1>
          <p className="max-w-md text-sm leading-6 text-zinc-400">
            Upload a reference and a target. Get palette, score, and findings.
          </p>
        </motion.div>
      </AuroraBackground>

      {/* Upload + results — sits below the hero */}
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-white/8 bg-zinc-800/50 p-6 shadow-xl backdrop-blur-sm md:p-8">
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
    </div>
  );
}
