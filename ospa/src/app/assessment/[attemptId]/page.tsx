"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { useAutosave } from "@/lib/useAutosave";

interface Question {
  id: string;
  prompt: string;
  order: number;
  options: { min: number; max: number; minLabel: string; maxLabel: string };
}

interface AttemptData {
  attempt: { id: string; status: string; responses: { questionId: string; value: number }[] };
  module: { title: string; description: string; questions: Question[] };
}

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = usePromise(params);
  const router = useRouter();

  const [data, setData] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/assessments/${attemptId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load assessment");
        return res.json();
      })
      .then((json: AttemptData) => {
        setData(json);
        const initial: Record<string, number> = {};
        for (const r of json.attempt.responses) {
          initial[r.questionId] = Number(r.value);
        }
        setAnswers(initial);
      })
      .catch(() => setError("Could not load this assessment. Please return to your dashboard."));
  }, [attemptId]);

  async function persist(questionId: string, value: number) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/assessments/${attemptId}/responses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, value }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    }
  }

  const { schedule, flush } = useAutosave(persist);

  function handleAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    schedule(questionId, value);
  }

  async function handleSubmit() {
    if (!data) return;
    const unanswered = data.module.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all questions (${unanswered.length} remaining).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Flush any in-flight debounced saves before submitting.
    await Promise.all(data.module.questions.map((q) => flush(q.id)));

    const res = await fetch(`/api/assessments/${attemptId}/submit`, { method: "POST" });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Submission failed. Please try again.");
      return;
    }

    router.push(`/report/${attemptId}`);
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-red-400">{error}</p>
        <a href="/dashboard" className="mt-4 inline-block text-brand-500 hover:underline">
          Back to dashboard
        </a>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center text-slate-400">
        Loading assessment...
      </main>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = data.module.questions.length;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-xl font-semibold">{data.module.title}</h1>
        <p className="text-sm text-slate-400">{data.module.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {answeredCount} / {totalCount} answered
          </span>
          <span>
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "All changes saved"}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
          <div
            className="h-1.5 rounded-full bg-brand-500 transition-all"
            style={{ width: `${totalCount === 0 ? 0 : (answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </header>

      <div className="space-y-8">
        {data.module.questions.map((q) => (
          <fieldset key={q.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
            <legend className="mb-4 text-sm text-slate-200">{q.prompt}</legend>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{q.options.minLabel}</span>
              <span>{q.options.maxLabel}</span>
            </div>
            <div className="mt-2 flex justify-between gap-2">
              {Array.from(
                { length: q.options.max - q.options.min + 1 },
                (_, i) => q.options.min + i
              ).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAnswer(q.id, val)}
                  onBlur={() => flush(q.id)}
                  aria-pressed={answers[q.id] === val}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${
                    answers[q.id] === val
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-700 text-slate-300 hover:border-brand-500"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full rounded-md bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit assessment"}
      </button>
    </main>
  );
}
