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
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-sky-600";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
};

export function ResultsPanel({ result, previews }: ResultsPanelProps) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                Match Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{result.summary}</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-right">
              <div className={`text-4xl font-semibold ${scoreTone(result.colorMatchScore)}`}>
                {result.colorMatchScore}
              </div>
              <div className="text-sm text-slate-500">match score</div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Confidence</p>
              <p className="mt-2 text-lg font-medium text-slate-900">{Math.round(result.confidence * 100)}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Analysis Time</p>
              <p className="mt-2 text-lg font-medium text-slate-900">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                Reference
              </p>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image alt="Reference preview" className="object-cover" fill src={previews.referencePreview} unoptimized />
              </div>
            </div>
          ) : null}

          {previews.targetPreview ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Target
              </p>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image alt="Target preview" className="object-cover" fill src={previews.targetPreview} unoptimized />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Reference Palette</p>
          <div className="mt-4 grid gap-3">
            {result.referencePalette.map((color) => (
              <div
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                key={`reference-${color.hex}`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                  <div>
                    <p className="font-medium text-slate-900">{color.hex}</p>
                    <p className="text-sm text-slate-500">{color.role}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-600">{Math.round(color.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Target Palette</p>
          <div className="mt-4 grid gap-3">
            {result.targetPalette.map((color) => (
              <div
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                key={`target-${color.hex}`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                  <div>
                    <p className="font-medium text-slate-900">{color.hex}</p>
                    <p className="text-sm text-slate-500">{color.role}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-600">{Math.round(color.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Findings</p>
          <ul className="mt-4 grid gap-3">
            {result.findings.map((finding) => (
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800" key={finding}>
                {finding}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Suggestions</p>
          <ul className="mt-4 grid gap-3">
            {result.suggestions.map((suggestion) => (
              <li
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
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
