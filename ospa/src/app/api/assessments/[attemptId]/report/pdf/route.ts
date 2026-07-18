import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderReportHtml } from "@/lib/reportHtml";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { report: true, user: true },
  });

  if (!attempt || attempt.userId !== session.user.id || !attempt.report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = renderReportHtml({
    candidateName: attempt.user.name ?? attempt.user.email,
    generatedAt: attempt.report.createdAt,
    overallScore: attempt.report.overallScore,
    factorScores: attempt.report.factorScores as Record<string, number>,
    olqScores: attempt.report.olqScores as Record<string, number>,
    narrative: attempt.report.narrative,
  });

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH || (await chromium.executablePath());

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

  let pdfBuffer: Buffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    pdfBuffer = Buffer.from(
      await page.pdf({ format: "A4", printBackground: true, margin: { top: "20px", bottom: "20px" } })
    );
  } finally {
    await browser.close();
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: "REPORT_PDF_DOWNLOADED",
    entity: "Report",
    entityId: attempt.report.id,
    ip: req.headers.get("x-forwarded-for"),
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ospa-report-${attemptId}.pdf"`,
    },
  });
}
