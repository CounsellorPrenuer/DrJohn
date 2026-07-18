import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Role check is enforced in middleware.ts, but this is repeated here as a
// defense-in-depth check since this page also renders sensitive audit data.
export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [userCount, attemptStats, recentLogs] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.assessmentAttempt.groupBy({ by: ["status"], _count: true }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { actor: { select: { email: true } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Admin overview</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Candidates" value={userCount} />
        {attemptStats.map((s) => (
          <StatCard key={s.status} label={s.status.replace("_", " ")} value={s._count} />
        ))}
      </div>

      <h2 className="mb-3 text-sm font-medium text-slate-300">Recent audit activity</h2>
      <div className="overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800">
                <td className="px-3 py-2 text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{log.actor?.email ?? "system"}</td>
                <td className="px-3 py-2">{log.action}</td>
                <td className="px-3 py-2 text-slate-400">
                  {log.entity}
                  {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs capitalize text-slate-400">{label}</p>
    </div>
  );
}
