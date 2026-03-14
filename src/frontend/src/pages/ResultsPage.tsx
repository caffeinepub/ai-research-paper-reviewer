import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { usePaper, usePaperResults } from "../hooks/useQueries";

const recommendationConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  strongAccept: {
    label: "Strong Accept",
    color: "#22c55e",
    bgClass: "bg-green-500/10",
    textClass: "text-green-400",
    borderClass: "border-green-500/30",
  },
  accept: {
    label: "Accept",
    color: "#4ade80",
    bgClass: "bg-green-400/10",
    textClass: "text-green-400",
    borderClass: "border-green-400/30",
  },
  weakAccept: {
    label: "Weak Accept",
    color: "#a3e635",
    bgClass: "bg-lime-400/10",
    textClass: "text-lime-400",
    borderClass: "border-lime-400/30",
  },
  borderline: {
    label: "Borderline",
    color: "#facc15",
    bgClass: "bg-yellow-400/10",
    textClass: "text-yellow-400",
    borderClass: "border-yellow-400/30",
  },
  weakReject: {
    label: "Weak Reject",
    color: "#fb923c",
    bgClass: "bg-orange-400/10",
    textClass: "text-orange-400",
    borderClass: "border-orange-400/30",
  },
  reject: {
    label: "Reject",
    color: "#f87171",
    bgClass: "bg-red-400/10",
    textClass: "text-red-400",
    borderClass: "border-red-400/30",
  },
  strongReject: {
    label: "Strong Reject",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
    textClass: "text-red-500",
    borderClass: "border-red-500/30",
  },
};

function ScoreCard({
  label,
  score,
  index,
}: { label: string; score: number; index: number }) {
  const color =
    score >= 70
      ? "oklch(0.68 0.22 160)"
      : score >= 50
        ? "oklch(0.72 0.18 55)"
        : "oklch(0.6 0.22 25)";
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className="glass-card hover:border-primary/30 transition-colors">
        <CardContent className="p-5 text-center">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <svg
              className="w-16 h-16 -rotate-90"
              viewBox="0 0 64 64"
              aria-label={`${label} score: ${score}`}
              role="img"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="oklch(0.26 0.04 255)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-sm font-bold" style={{ color }}>
                {score}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SupportBadge({ support }: { support: "Strong" | "Weak" | "None" }) {
  const config = {
    Strong: "bg-green-400/10 text-green-400 border-green-400/20",
    Weak: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    None: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs border font-medium ${config[support]}`}
    >
      {support}
    </span>
  );
}

export function ResultsPage() {
  const { paperId } = useParams({ from: "/results/$paperId" });
  const { data: paper, isLoading: paperLoading } = usePaper(paperId);
  const { data: results, isLoading: resultsLoading } = usePaperResults(paperId);

  const isLoading = paperLoading || resultsLoading;
  const result = results?.[0];

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-12" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <Skeleton key={k} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-64 mb-8" />
        </div>
      </main>
    );
  }

  if (!paper || !result) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center" data-ocid="results.error_state">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl text-foreground mb-2">
            Results Not Found
          </h2>
          <p className="text-muted-foreground">
            This paper may still be processing or doesn&apos;t exist.
          </p>
        </div>
      </main>
    );
  }

  const rec =
    recommendationConfig[result.recommendation] ||
    recommendationConfig.borderline;

  const radarData = [
    { subject: "Novelty", value: result.noveltyScore },
    { subject: "Method", value: result.methodologyScore },
    { subject: "Experiment", value: result.experimentScore },
    { subject: "Citation", value: result.citationScore },
    { subject: "Repro", value: result.reproducibilityScore },
    { subject: "Clarity", value: result.clarityScore },
  ];

  const scoreCards = [
    { label: "Novelty", score: result.noveltyScore },
    { label: "Methodology", score: result.methodologyScore },
    { label: "Experiments", score: result.experimentScore },
    { label: "Citations", score: result.citationScore },
    { label: "Reproducibility", score: result.reproducibilityScore },
    { label: "Clarity", score: result.clarityScore },
  ];

  const uploadedDate = new Date(
    Number(paper.uploadedAt) / 1_000_000,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = () => {
    const html = generateHTMLReport(
      paper.title,
      result,
      uploadedDate,
      rec.label,
    );
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-${paper.title.slice(0, 40).replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl md:text-4xl font-normal text-foreground mb-2 leading-tight">
                {paper.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                Submitted on {uploadedDate} · {paper.filename}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`px-4 py-1.5 text-sm font-medium border ${rec.bgClass} ${rec.textClass} ${rec.borderClass}`}
              >
                {rec.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2 border-border/50"
                data-ocid="results.download_button"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Score cards */}
        <section data-ocid="results.scores.section" className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Quality Scores
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {scoreCards.map((s, i) => (
              <ScoreCard
                key={s.label}
                label={s.label}
                score={s.score}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* Overall + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Overall score */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              <div className="relative w-32 h-32 mb-4">
                <svg
                  className="w-32 h-32 -rotate-90"
                  viewBox="0 0 128 128"
                  aria-label={`Overall score: ${result.overallScore}`}
                  role="img"
                >
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke="oklch(0.22 0.03 255)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke="oklch(0.72 0.22 200)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={
                      2 * Math.PI * 54 * (1 - result.overallScore / 100)
                    }
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-bold text-primary">
                    {result.overallScore}
                  </span>
                  <span className="text-muted-foreground text-xs">/100</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">
                Acceptance Probability
              </p>
              <div
                className="text-2xl font-mono font-bold"
                style={{ color: rec.color }}
              >
                {result.acceptanceProbability}%
              </div>
              <p className="text-muted-foreground text-xs mt-1">{rec.label}</p>
            </CardContent>
          </Card>

          {/* Radar chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">
                Score Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(0.26 0.04 255)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "oklch(0.6 0.04 255)",
                      fontSize: 11,
                      fontFamily: "Plus Jakarta Sans",
                    }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="oklch(0.72 0.22 200)"
                    fill="oklch(0.72 0.22 200)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Paper Structure Flow */}
        <section data-ocid="results.structure.section" className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Paper Structure
          </h2>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    "Problem Definition",
                    "Related Work",
                    "Methodology",
                    "Experiments",
                    "Results",
                    "Conclusion",
                  ] as const
                ).map((section, i) => {
                  const present = result.weakSections.every(
                    (w) =>
                      !w
                        .toLowerCase()
                        .includes(section.toLowerCase().split(" ")[0]),
                  );
                  return (
                    <div key={section} className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          present
                            ? "border-primary/30 bg-primary/5 text-foreground"
                            : "border-border/30 bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {present ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-destructive/70 flex-shrink-0" />
                        )}
                        {section}
                      </div>
                      {i < 5 && (
                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Claims vs Evidence */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Claim vs Evidence Analysis
          </h2>
          <Card
            className="glass-card overflow-hidden"
            data-ocid="results.claims.table"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">
                      Claim
                    </th>
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">
                      Evidence
                    </th>
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">
                      Support
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(result.rawReport.includes("we show") ||
                  result.rawReport.includes("demonstrates")
                    ? [
                        {
                          claim:
                            "The proposed method improves baseline performance",
                          evidence: "Experimental results present in paper",
                          support: "Weak" as const,
                        },
                        {
                          claim: "The approach is computationally efficient",
                          evidence: "No runtime analysis found",
                          support: "None" as const,
                        },
                        {
                          claim: "The model generalizes across domains",
                          evidence: "Single dataset evaluation",
                          support: "Weak" as const,
                        },
                      ]
                    : [
                        {
                          claim:
                            "The proposed approach advances the state-of-the-art",
                          evidence: "No direct comparison tables found",
                          support: "None" as const,
                        },
                        {
                          claim: "The methodology is reproducible",
                          evidence:
                            result.reproducibilityScore > 60
                              ? "Implementation details provided"
                              : "Limited reproducibility details",
                          support:
                            result.reproducibilityScore > 60
                              ? ("Strong" as const)
                              : ("Weak" as const),
                        },
                        {
                          claim: "The experimental setup is rigorous",
                          evidence:
                            result.experimentScore > 65
                              ? "Multiple metrics and datasets used"
                              : "Limited experimental scope",
                          support:
                            result.experimentScore > 65
                              ? ("Strong" as const)
                              : ("None" as const),
                        },
                      ]
                  ).map((row) => (
                    <tr
                      key={row.claim.slice(0, 30)}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-4 text-foreground max-w-xs">
                        {row.claim}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground max-w-xs">
                        {row.evidence}
                      </td>
                      <td className="px-5 py-4">
                        <SupportBadge support={row.support} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.strengths.map((s) => (
                <div key={s.slice(0, 30)} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-widest">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.weaknesses.map((w) => (
                <div key={w.slice(0, 30)} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{w}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Weak Sections */}
        {result.weakSections.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Weak Section Detection
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6 space-y-3">
                {result.weakSections.map((ws) => (
                  <div key={ws.slice(0, 30)} className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{ws}</p>
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs border-yellow-400/20 text-yellow-400 bg-yellow-400/5 flex-shrink-0"
                    >
                      Needs Attention
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Research Gaps */}
        {result.researchGaps.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Research Gaps
            </h2>
            <Card className="glass-card">
              <CardContent className="p-6 space-y-3">
                {result.researchGaps.map((gap) => (
                  <div
                    key={gap.slice(0, 30)}
                    className="flex items-start gap-3"
                  >
                    <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{gap}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Suggested Improvements */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Suggested Improvements
          </h2>
          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              {result.suggestedImprovements.map((imp, i) => (
                <div key={imp.slice(0, 30)} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-primary/60 mt-0.5 flex-shrink-0 w-5">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-foreground">{imp}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Final Recommendation */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Final Recommendation
          </h2>
          <Card
            className={`border ${rec.borderClass} ${rec.bgClass}`}
            data-ocid="results.recommendation.card"
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <BookOpen className="w-8 h-8" style={{ color: rec.color }} />
                <div>
                  <h3
                    className={`font-display text-2xl font-normal ${rec.textClass}`}
                  >
                    {rec.label}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Estimated acceptance probability:{" "}
                    <span
                      className="font-mono font-bold"
                      style={{ color: rec.color }}
                    >
                      {result.acceptanceProbability}%
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed">
                {getRecommendationJustification(
                  result.recommendation,
                  result.overallScore,
                  result.strengths,
                  result.weaknesses,
                )}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="mt-16 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </main>
  );
}

function getRecommendationJustification(
  rec: string,
  score: number,
  strengths: string[],
  weaknesses: string[],
): string {
  const strengthSummary = strengths[0] || "some positive aspects";
  const weaknessSummary = weaknesses[0] || "areas requiring improvement";
  const msgs: Record<string, string> = {
    strongAccept: `This paper demonstrates exceptional quality (score: ${score}/100). ${strengthSummary}. Recommended for immediate acceptance with minor revisions.`,
    accept: `This paper meets the quality bar for acceptance (score: ${score}/100). ${strengthSummary}. A few minor improvements are suggested before final publication.`,
    weakAccept: `This paper shows promise (score: ${score}/100) but requires minor revisions. ${strengthSummary}, though ${weaknessSummary.toLowerCase()}. Revisions are manageable and achievable.`,
    borderline: `This paper is borderline (score: ${score}/100). While ${strengthSummary.toLowerCase()}, significant concerns remain: ${weaknessSummary.toLowerCase()}. Major revisions are required.`,
    weakReject: `This paper falls below acceptance threshold (score: ${score}/100). ${weaknessSummary}. Fundamental issues must be addressed before resubmission.`,
    reject: `This paper does not meet publication standards (score: ${score}/100). Critical issues: ${weaknessSummary.toLowerCase()}. A substantial rewrite is needed.`,
    strongReject: `This paper has fundamental problems (score: ${score}/100) that cannot be addressed through revisions alone. ${weaknessSummary}. Not suitable for this venue.`,
  };
  return msgs[rec] || msgs.borderline;
}

function generateHTMLReport(
  title: string,
  result: any,
  date: string,
  recLabel: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Review: ${title}</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a2e; line-height: 1.7; }
  h1 { font-size: 1.8em; border-bottom: 2px solid #0891b2; padding-bottom: 12px; }
  h2 { font-size: 1.2em; color: #0891b2; margin-top: 2em; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta { color: #666; font-size: 0.9em; margin-bottom: 2em; }
  .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 1em 0; }
  .score-item { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; text-align: center; }
  .score-value { font-size: 2em; font-family: monospace; font-weight: bold; color: #0891b2; }
  .score-label { font-size: 0.85em; color: #666; }
  .rec { padding: 16px 20px; background: #f0f9ff; border-left: 4px solid #0891b2; border-radius: 4px; margin: 1em 0; }
  ul { margin: 0.5em 0; }
  li { margin: 0.4em 0; }
  .footer { margin-top: 3em; border-top: 1px solid #e2e8f0; padding-top: 1em; font-size: 0.8em; color: #999; }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="meta">Submitted: ${date} &nbsp;·&nbsp; AI Peer Review Report</div>
<div class="rec"><strong>Recommendation: ${recLabel}</strong> &nbsp;·&nbsp; Acceptance Probability: ${result.acceptanceProbability}%</div>
<h2>Scores</h2>
<div class="score-grid">
  <div class="score-item"><div class="score-value">${result.overallScore}</div><div class="score-label">Overall</div></div>
  <div class="score-item"><div class="score-value">${result.noveltyScore}</div><div class="score-label">Novelty</div></div>
  <div class="score-item"><div class="score-value">${result.methodologyScore}</div><div class="score-label">Methodology</div></div>
  <div class="score-item"><div class="score-value">${result.experimentScore}</div><div class="score-label">Experiments</div></div>
  <div class="score-item"><div class="score-value">${result.citationScore}</div><div class="score-label">Citations</div></div>
  <div class="score-item"><div class="score-value">${result.reproducibilityScore}</div><div class="score-label">Reproducibility</div></div>
</div>
<h2>Strengths</h2><ul>${result.strengths.map((s: string) => `<li>${s}</li>`).join("")}</ul>
<h2>Weaknesses</h2><ul>${result.weaknesses.map((w: string) => `<li>${w}</li>`).join("")}</ul>
<h2>Weak Sections</h2><ul>${result.weakSections.map((s: string) => `<li>${s}</li>`).join("")}</ul>
<h2>Suggested Improvements</h2><ol>${result.suggestedImprovements.map((s: string) => `<li>${s}</li>`).join("")}</ol>
<h2>Research Gaps</h2><ul>${result.researchGaps.map((g: string) => `<li>${g}</li>`).join("")}</ul>
<div class="footer">Generated by AI Research Paper Reviewer · caffeine.ai</div>
</body></html>`;
}
