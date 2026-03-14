export interface ClaimEvidence {
  claim: string;
  evidence: string;
  support: "Strong" | "Weak" | "None";
}

export interface StructureSection {
  section: string;
  present: boolean;
  quality: "strong" | "weak" | "missing";
}

export interface PaperAnalysis {
  detectedSections: string[];
  title: string;
  scores: {
    novelty: number;
    methodology: number;
    experiment: number;
    citation: number;
    reproducibility: number;
    clarity: number;
    overall: number;
  };
  claims: ClaimEvidence[];
  weakSections: string[];
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  recommendation: string;
  acceptanceProbability: number;
  researchGaps: string[];
  rawReport: string;
  structureFlow: StructureSection[];
}

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      found.add(kw);
    }
  }
  return found.size;
}

function hasSection(text: string, names: string[]): boolean {
  const lower = text.toLowerCase();
  return names.some((n) => lower.includes(n.toLowerCase()));
}

export function analyzePaper(text: string, filename: string): PaperAnalysis {
  const lower = text.toLowerCase();

  // ---- Title extraction ----
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  let title = filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
  for (const line of lines) {
    if (
      line.length >= 10 &&
      line.length <= 200 &&
      !/^(abstract|introduction|keywords)/i.test(line)
    ) {
      title = line;
      break;
    }
  }

  // ---- Section detection ----
  const sectionDefs: { key: string; names: string[] }[] = [
    { key: "Abstract", names: ["abstract"] },
    { key: "Introduction", names: ["introduction", "1. introduction"] },
    {
      key: "Related Work",
      names: ["related work", "background", "literature"],
    },
    {
      key: "Methodology",
      names: ["methodology", "method", "approach", "proposed"],
    },
    { key: "Experiments", names: ["experiment", "evaluation", "empirical"] },
    { key: "Results", names: ["result", "findings", "performance"] },
    { key: "Conclusion", names: ["conclusion", "summary", "future work"] },
    { key: "References", names: ["references", "bibliography"] },
  ];

  const detectedSections: string[] = [];
  for (const sd of sectionDefs) {
    if (hasSection(text, sd.names)) detectedSections.push(sd.key);
  }

  // ---- Scores ----
  const noveltyKws = [
    "novel",
    "new approach",
    "first",
    "propose",
    "contribution",
    "state-of-the-art",
    "outperform",
    "pioneering",
    "breakthrough",
  ];
  const noveltyCount = countKeywords(text, noveltyKws);
  const novelty = Math.min(95, 45 + noveltyCount * 5);

  const methodKws = [
    "algorithm",
    "framework",
    "architecture",
    "model",
    "approach",
    "proposed method",
    "technique",
    "pipeline",
    "formulation",
    "optimization",
  ];
  const methodCount = countKeywords(text, methodKws);
  const methodology = Math.min(95, 40 + methodCount * 6);

  const expKws = [
    "dataset",
    "baseline",
    "ablation",
    "benchmark",
    "experiment",
    "evaluation",
    "accuracy",
    "precision",
    "recall",
    "f1",
    "performance",
    "metric",
  ];
  const expCount = countKeywords(text, expKws);
  const experiment = Math.min(90, 35 + expCount * 5);

  const citationMatches = (
    text.match(/\[\d+\]|\[\w+[,\s]+\d{4}\]|\(\d{4}\)|\(20\d{2}\)/g) || []
  ).length;
  const citation = Math.min(95, 40 + citationMatches * 2);

  const reproKws = [
    "github",
    "code available",
    "open source",
    "dataset available",
    "hyperparameter",
    "learning rate",
    "batch size",
    "epochs",
    "implementation details",
    "reproducible",
  ];
  const reproCount = countKeywords(text, reproKws);
  const reproducibility = Math.min(95, 30 + reproCount * 8);

  let clarity =
    text.length > 8000
      ? 75
      : text.length > 5000
        ? 70
        : text.length > 3000
          ? 60
          : 45;
  if (detectedSections.length >= 5) clarity += 10;
  if (detectedSections.length >= 7) clarity += 5;
  clarity = Math.min(90, clarity);

  const overall = Math.round(
    (novelty +
      methodology +
      experiment +
      citation +
      reproducibility +
      clarity) /
      6,
  );

  // ---- Claims extraction ----
  const claimPatterns = [
    "we show",
    "we demonstrate",
    "results show",
    "outperforms",
    "achieves",
    "improves",
    "significantly",
    "our method",
    "proposed model",
  ];
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  const claimSentences: string[] = [];
  for (const sentence of sentences) {
    if (claimPatterns.some((p) => sentence.toLowerCase().includes(p))) {
      claimSentences.push(sentence);
      if (claimSentences.length >= 5) break;
    }
  }

  const claims: ClaimEvidence[] = claimSentences.map((claim, _i) => {
    const nearbyText = text.substring(
      Math.max(0, text.indexOf(claim) - 300),
      text.indexOf(claim) + 300,
    );
    const hasEvidence = /table|figure|fig\.|experiment|result/i.test(
      nearbyText,
    );
    const hasStrong =
      /table \d|figure \d|fig\. \d|shows that|demonstrates that/i.test(
        nearbyText,
      );
    const support: "Strong" | "Weak" | "None" = hasStrong
      ? "Strong"
      : hasEvidence
        ? "Weak"
        : "None";
    const evidenceMsg = hasStrong
      ? "Supported by experimental data (Table/Figure present)"
      : hasEvidence
        ? "Partially supported by results section"
        : "No direct experimental evidence found";
    return {
      claim: claim.slice(0, 180) + (claim.length > 180 ? "..." : ""),
      evidence: evidenceMsg,
      support,
    };
  });

  // Add default claims if too few
  if (claims.length === 0) {
    claims.push(
      {
        claim: "The paper presents a novel contribution to the field",
        evidence: "No direct evidence cited",
        support: "None",
      },
      {
        claim: "The proposed approach outperforms existing methods",
        evidence: "No comparative results found",
        support: "None",
      },
    );
  }

  // ---- Weak section detection ----
  const weakSections: string[] = [];
  if (!lower.includes("ablation")) weakSections.push("Missing ablation study");
  if (!lower.includes("dataset") && !lower.includes("data set"))
    weakSections.push("Dataset description insufficient");
  if (!lower.includes("baseline"))
    weakSections.push("Baseline comparisons missing");
  if (!lower.includes("limitation") && !lower.includes("future work"))
    weakSections.push("Limitations not discussed");
  if (!lower.includes("related work") && !lower.includes("background"))
    weakSections.push("Related work section weak or missing");
  if (experiment < 50) weakSections.push("Experimental evaluation is limited");
  if (reproducibility < 40)
    weakSections.push("Reproducibility details are insufficient");

  // ---- Strengths ----
  const strengths: string[] = [];
  if (novelty > 70)
    strengths.push(
      "Clear novelty contribution with well-articulated research goals",
    );
  if (methodology > 70)
    strengths.push(
      "Well-described methodology with sufficient technical depth",
    );
  if (citation > 60)
    strengths.push("Good citation coverage and literature awareness");
  if (experiment > 65)
    strengths.push(
      "Comprehensive experimental evaluation across multiple metrics",
    );
  if (reproducibility > 60)
    strengths.push("Strong reproducibility details provided");
  if (clarity > 70) strengths.push("Clear and well-structured writing");
  if (detectedSections.length >= 6)
    strengths.push("Paper follows standard academic structure");
  if (strengths.length === 0)
    strengths.push("Research problem is clearly identified");

  // ---- Weaknesses ----
  const weaknesses: string[] = [];
  if (experiment < 50)
    weaknesses.push("Limited experimental evaluation and dataset diversity");
  if (reproducibility < 50)
    weaknesses.push(
      "Insufficient reproducibility details (no code/hyperparameters)",
    );
  if (novelty < 55)
    weaknesses.push(
      "Novelty claims are not sufficiently differentiated from prior work",
    );
  if (citation < 50)
    weaknesses.push(
      "Citation coverage is sparse; key related work may be missing",
    );
  if (methodology < 55)
    weaknesses.push("Methodological description lacks rigor");
  if (clarity < 60) weaknesses.push("Writing clarity needs improvement");
  if (weaknesses.length === 0)
    weaknesses.push("Minor improvements needed in experimental rigor");

  // ---- Improvements ----
  const suggestedImprovements: string[] = [
    "Include an ablation study to validate each component's contribution",
    "Provide more diverse and larger-scale dataset evaluations",
    "Release code and pre-trained models for reproducibility",
    "Expand the related work section with more recent citations (post-2022)",
    "Add a dedicated limitations section discussing failure cases",
    "Include statistical significance tests for all reported metrics",
  ];

  // ---- Recommendation ----
  let recommendation: string;
  let acceptanceProbability: number;
  if (overall >= 75) {
    recommendation = "accept";
    acceptanceProbability = 80 + Math.round(Math.random() * 15);
  } else if (overall >= 65) {
    recommendation = "weakAccept";
    acceptanceProbability = 60 + Math.round(Math.random() * 19);
  } else if (overall >= 50) {
    recommendation = "borderline";
    acceptanceProbability = 40 + Math.round(Math.random() * 19);
  } else if (overall >= 35) {
    recommendation = "weakReject";
    acceptanceProbability = 20 + Math.round(Math.random() * 19);
  } else {
    recommendation = "reject";
    acceptanceProbability = 5 + Math.round(Math.random() * 14);
  }

  // ---- Research gaps ----
  const researchGaps: string[] = [
    "Long-term deployment evaluation missing — real-world performance under distribution shift",
    "Cross-domain generalization not tested — results may not transfer to other domains",
  ];
  if (/nlp|language model|text|bert|gpt|transformer/i.test(text)) {
    researchGaps.unshift(
      "Multilingual extensions not explored — model tested only on English",
    );
  }
  if (/image|vision|cnn|convolution|visual|pixel/i.test(text)) {
    researchGaps.unshift(
      "3D spatial understanding gap — model tested only on 2D visual inputs",
    );
  }
  if (/graph|network|node|edge/i.test(text)) {
    researchGaps.unshift("Scalability to heterogeneous graphs not addressed");
  }
  researchGaps.push(
    "Human evaluation study absent — automatic metrics may not reflect user preference",
  );

  // ---- Structure flow ----
  const structureFlow: StructureSection[] = [
    {
      section: "Problem Definition",
      present: hasSection(text, ["introduction", "problem", "motivation"]),
      quality: hasSection(text, ["introduction"]) ? "strong" : "missing",
    },
    {
      section: "Related Work",
      present: hasSection(text, ["related work", "background", "literature"]),
      quality: hasSection(text, ["related work"])
        ? "strong"
        : hasSection(text, ["background"])
          ? "weak"
          : "missing",
    },
    {
      section: "Methodology",
      present: hasSection(text, ["method", "approach", "algorithm"]),
      quality:
        methodology > 65 ? "strong" : methodology > 45 ? "weak" : "missing",
    },
    {
      section: "Experiments",
      present: hasSection(text, ["experiment", "evaluation"]),
      quality:
        experiment > 65 ? "strong" : experiment > 45 ? "weak" : "missing",
    },
    {
      section: "Results",
      present: hasSection(text, ["result", "finding", "performance"]),
      quality: hasSection(text, ["result"]) ? "strong" : "missing",
    },
    {
      section: "Conclusion",
      present: hasSection(text, ["conclusion", "summary"]),
      quality: hasSection(text, ["conclusion"]) ? "strong" : "missing",
    },
  ];

  // ---- Raw report ----
  const recLabel: Record<string, string> = {
    accept: "Accept",
    weakAccept: "Weak Accept",
    borderline: "Borderline",
    weakReject: "Weak Reject",
    reject: "Reject",
  };
  const rawReport = `
PEER REVIEW REPORT
==================
Paper: ${title}
Overall Score: ${overall}/100
Recommendation: ${recLabel[recommendation] || recommendation}
Acceptance Probability: ${acceptanceProbability}%

SCORES
------
Novelty:         ${novelty}/100
Methodology:     ${methodology}/100
Experiment:      ${experiment}/100
Citation:        ${citation}/100
Reproducibility: ${reproducibility}/100
Clarity:         ${clarity}/100

STRENGTHS
---------
${strengths.map((s) => `• ${s}`).join("\n")}

WEAKNESSES
----------
${weaknesses.map((w) => `• ${w}`).join("\n")}

WEAK SECTIONS
-------------
${weakSections.map((s) => `• ${s}`).join("\n")}

SUGGESTED IMPROVEMENTS
-----------------------
${suggestedImprovements.map((s, i) => `${i + 1}. ${s}`).join("\n")}

RESEARCH GAPS
-------------
${researchGaps.map((g) => `• ${g}`).join("\n")}

DETECTED SECTIONS: ${detectedSections.join(", ")}
`;

  return {
    detectedSections,
    title,
    scores: {
      novelty,
      methodology,
      experiment,
      citation,
      reproducibility,
      clarity,
      overall,
    },
    claims,
    weakSections,
    strengths,
    weaknesses,
    suggestedImprovements,
    recommendation,
    acceptanceProbability,
    researchGaps,
    rawReport,
    structureFlow,
  };
}
