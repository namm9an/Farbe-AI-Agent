"use client";

import { useState, useTransition } from "react";

import type { AnalysisResult } from "@/types/analysis";

type PreviewState = {
  referencePreview: string | null;
  targetPreview: string | null;
};

type AnalyzerFormProps = {
  onResult: (result: AnalysisResult, previews: PreviewState) => void;
};

const readPreview = (file: File | null) => (file ? URL.createObjectURL(file) : null);

export function AnalyzerForm({ onResult }: AnalyzerFormProps) {
  const [reference, setReference] = useState<File | null>(null);
  const [target, setTarget] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!reference || !target) {
      setError("Upload both the reference asset and the target design before running analysis.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("target", target);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as AnalysisResult | { error: string };

      if (!response.ok || "error" in payload) {
        setError("error" in payload ? payload.error : "The analysis request failed.");
        return;
      }

      onResult(payload, {
        referencePreview: readPreview(reference),
        targetPreview: readPreview(target),
      });
    });
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-200">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Reference Asset
          </span>
          <input
            accept="image/*"
            className="block w-full rounded-2xl border border-dashed border-cyan-400/30 bg-slate-900/70 px-4 py-6 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-medium file:text-slate-950"
            name="reference"
            onChange={(event) => setReference(event.target.files?.[0] ?? null)}
            type="file"
          />
          <span className="mt-3 block text-slate-400">
            Use a clean logo, banner crop, or brand asset for the best palette extraction.
          </span>
        </label>

        <label className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-200">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Target Design
          </span>
          <input
            accept="image/*"
            className="block w-full rounded-2xl border border-dashed border-emerald-400/30 bg-slate-900/70 px-4 py-6 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-300 file:px-4 file:py-2 file:font-medium file:text-slate-950"
            name="target"
            onChange={(event) => setTarget(event.target.files?.[0] ?? null)}
            type="file"
          />
          <span className="mt-3 block text-slate-400">
            Upload the event creative, social banner, booth mockup, or design you want checked.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
        <div className="text-sm text-slate-300">
          The app uses deterministic color comparison first, then adds model-generated wording if your endpoint is configured.
        </div>
        <button
          className="rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Analyzing..." : "Run Brand Analysis"}
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </form>
  );
}
