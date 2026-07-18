"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartAssessmentButton({
  resumeAttemptId,
}: {
  resumeAttemptId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (resumeAttemptId) {
      router.push(`/assessment/${resumeAttemptId}`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/assessments/start", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(`/assessment/${data.attempt.id}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
    >
      {loading ? "Starting..." : resumeAttemptId ? "Resume assessment" : "Start assessment"}
    </button>
  );
}
