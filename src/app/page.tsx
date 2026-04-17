"use client";

import { useState } from "react";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(52,211,153,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#07111f_48%,_#020617_100%)] px-4 py-8 text-white md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur md:p-8">
          <div className="grid gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Farbe AI Agent
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                Match brand colors with confidence before your design goes live.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Upload a reference brand asset and the design you are working on. The app extracts the working
                palette, scores the match, and returns designer-friendly findings that can be used during event
                and campaign execution.
              </p>
            </div>
          </div>

          <AnalyzerForm
            onResult={(nextResult, nextPreviews) => {
              setResult(nextResult);
              setPreviews(nextPreviews);
            }}
          />
        </section>

        {result ? <ResultsPanel previews={previews} result={result} /> : null}
      </div>
    </main>
  );
}
