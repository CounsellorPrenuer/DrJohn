"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "content", label: "Question content" },
  { value: "scoring", label: "Scoring / report" },
  { value: "bug", label: "Something's broken" },
  { value: "general", label: "General feedback" },
] as const;

export default function FeedbackWidget({ attemptId }: { attemptId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, category, message }),
    });
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) setMessage("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 text-xs text-slate-400 underline hover:text-slate-200"
      >
        Have feedback on this report?
      </button>
    );
  }

  if (status === "sent") {
    return <p className="mt-6 text-xs text-emerald-400">Thanks — your feedback was submitted.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <p className="mb-3 text-sm font-medium text-slate-200">Share feedback</p>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
        className="mb-2 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="What would you like us to know?"
        className="mb-2 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500"
      />
      {status === "error" && (
        <p className="mb-2 text-xs text-red-400">Please enter at least 5 characters.</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send feedback"}
      </button>
    </form>
  );
}
