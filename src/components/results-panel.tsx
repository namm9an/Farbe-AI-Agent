import Image from "next/image";

import type { AnalysisResult } from "@/types/analysis";

type ResultsPanelProps = {
  result: AnalysisResult;
  previews: {
    referencePreview: string | null;
    targetPreview: string | null;
  };
};

const scoreTone = (score: number) => {
  if (score >= 85) {
    return "text-emerald-300";
  }

  if (score >= 70) {
    return "text-cyan-300";
  }

  if (score >= 50) {
    return "text-amber-300";
  }

  return "text-rose-300";
};

export function ResultsPanel({ result, previews }: ResultsPanelProps) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Match Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{result.summary}</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right">
              <div className={`text-4xl font-semibold ${scoreTone(result.colorMatchScore)}`}>
                {result.colorMatchScore}
              </div>
              <div className="text-sm text-slate-400">match score</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Confidence</p>
              <p className="mt-2 text-lg font-medium text-white">{Math.round(result.confidence * 100)}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Analysis Time</p>
              <p className="mt-2 text-lg font-medium text-white">
                {new Date(result.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {previews.referencePreview ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Reference
              </p>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900">
                <Image alt="Reference preview" className="object-cover" fill src={previews.referencePreview} unoptimized />
              </div>
            </div>
          ) : null}

          {previews.targetPreview ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                Target
              </p>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900">
                <Image alt="Target preview" className="object-cover" fill src={previews.targetPreview} unoptimized />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Reference Palette</p>
          <div className="mt-4 grid gap-3">
            {result.referencePalette.map((color) => (
              <div
                className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
                key={`reference-${color.hex}`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl border border-white/20" style={{ backgroundColor: color.hex }} />
                  <div>
                    <p className="font-medium text-white">{color.hex}</p>
                    <p className="text-sm text-slate-400">{color.role}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-300">{Math.round(color.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Target Palette</p>
          <div className="mt-4 grid gap-3">
            {result.targetPalette.map((color) => (
              <div
                className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
                key={`target-${color.hex}`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl border border-white/20" style={{ backgroundColor: color.hex }} />
                  <div>
                    <p className="font-medium text-white">{color.hex}</p>
                    <p className="text-sm text-slate-400">{color.role}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-300">{Math.round(color.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Findings</p>
          <ul className="mt-4 grid gap-3">
            {result.findings.map((finding) => (
              <li className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200" key={finding}>
                {finding}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Suggestions</p>
          <ul className="mt-4 grid gap-3">
            {result.suggestions.map((suggestion) => (
              <li
                className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                key={suggestion}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
