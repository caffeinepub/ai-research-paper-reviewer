import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { analyzePaper } from "../aiEngine";
import { ExternalBlob } from "../backend";
import type { Recommendation, Status } from "../backend";
import { useActor } from "../hooks/useActor";

const ANALYSIS_STEPS = [
  { id: 1, label: "Uploading PDF to storage" },
  { id: 2, label: "Extracting text and sections" },
  { id: 3, label: "Analyzing methodology" },
  { id: 4, label: "Detecting claims & evidence" },
  { id: 5, label: "Evaluating reproducibility" },
  { id: 6, label: "Generating peer review report" },
];

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

async function loadPDFJS(): Promise<any> {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => resolve(window.pdfjsLib);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await loadPDFJS();
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `${content.items.map((item: any) => item.str).join(" ")}\n`;
  }
  return text;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => [...prev, step]);
  };

  const handleAnalyze = async () => {
    if (!file || !actor) {
      if (!actor) toast.error("Please sign in to analyze papers");
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(1);
    setCompletedSteps([]);
    setError(null);

    try {
      // Step 1: Upload to blob storage
      const paperId = crypto.randomUUID();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);

      completeStep(1);
      setCurrentStep(2);

      // Step 2: Extract text
      const text = await extractTextFromPDF(file);

      completeStep(2);
      setCurrentStep(3);

      // Step 3-5: AI Analysis (simulate progression)
      const analysis = analyzePaper(text, file.name);

      completeStep(3);
      setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 400));

      completeStep(4);
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 400));

      completeStep(5);
      setCurrentStep(6);

      // Save paper to backend
      await actor.addPaper(paperId, analysis.title, file.name, blob);
      await actor.updatePaperStatus(paperId, "uploaded" as Status);

      // Step 6: Generate and save report
      const resultId = crypto.randomUUID();
      const now = BigInt(Date.now()) * BigInt(1_000_000);

      const recommendationMap: Record<string, Recommendation> = {
        accept: "accept" as Recommendation,
        weakAccept: "weakAccept" as Recommendation,
        borderline: "borderline" as Recommendation,
        weakReject: "weakReject" as Recommendation,
        reject: "reject" as Recommendation,
        strongAccept: "strongAccept" as Recommendation,
        strongReject: "strongReject" as Recommendation,
      };

      await actor.addPaperResult({
        id: resultId,
        paperId,
        noveltyScore: analysis.scores.novelty,
        methodologyScore: analysis.scores.methodology,
        experimentScore: analysis.scores.experiment,
        citationScore: analysis.scores.citation,
        reproducibilityScore: analysis.scores.reproducibility,
        clarityScore: analysis.scores.clarity,
        overallScore: analysis.scores.overall,
        weakSections: analysis.weakSections,
        weaknesses: analysis.weaknesses,
        strengths: analysis.strengths,
        suggestedImprovements: analysis.suggestedImprovements,
        recommendation:
          recommendationMap[analysis.recommendation] ||
          ("borderline" as Recommendation),
        acceptanceProbability: analysis.acceptanceProbability,
        researchGaps: analysis.researchGaps,
        rawReport: analysis.rawReport,
        submittedAt: now,
      });

      await actor.updatePaperStatus(paperId, "reviewed" as Status);

      completeStep(6);
      await new Promise((r) => setTimeout(r, 600));

      navigate({ to: `/results/${paperId}` });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressPercent = isAnalyzing
    ? Math.round((completedSteps.length / ANALYSIS_STEPS.length) * 100)
    : 0;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-normal text-foreground mb-4">
              Upload Your Paper
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a PDF research paper to receive a structured AI peer review
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isAnalyzing ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      inputRef.current?.click();
                  }}
                  aria-label="Upload PDF dropzone"
                  data-ocid="upload.dropzone"
                  className={`
                    relative cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-all duration-200
                    ${
                      isDragOver
                        ? "border-primary bg-primary/5 glow-cyan"
                        : file
                          ? "border-primary/50 bg-primary/3"
                          : "border-border/50 hover:border-primary/50 hover:bg-primary/3"
                    }
                  `}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                    data-ocid="upload.upload_button"
                  />

                  <motion.div
                    animate={{ scale: isDragOver ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                      {file ? (
                        <FileText className="w-8 h-8 text-primary" />
                      ) : (
                        <Upload className="w-8 h-8 text-primary" />
                      )}
                    </div>

                    {file ? (
                      <div>
                        <p className="text-foreground font-medium text-lg mb-1">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-foreground font-medium text-lg mb-2">
                          {isDragOver
                            ? "Drop your PDF here"
                            : "Drag & drop your PDF"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          or click to browse files
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {file && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-start gap-3"
                    data-ocid="upload.error_state"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-destructive text-sm">{error}</p>
                  </motion.div>
                )}

                <div className="mt-6">
                  <Button
                    size="lg"
                    disabled={!file || !actor}
                    onClick={handleAnalyze}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium disabled:opacity-50"
                    data-ocid="upload.submit_button"
                  >
                    {!actor ? "Sign in to Analyze" : "Analyze Paper"}
                  </Button>
                  {!actor && (
                    <p className="text-center text-muted-foreground text-sm mt-3">
                      Sign in using the button in the top nav to proceed
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                data-ocid="upload.loading_state"
              >
                <Card className="glass-card">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <h2 className="font-display text-2xl font-normal text-foreground mb-2">
                        Analyzing Paper
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Please wait while the AI evaluates your paper…
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono text-primary">
                          {progressPercent}%
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      {ANALYSIS_STEPS.map((step) => {
                        const isDone = completedSteps.includes(step.id);
                        const isCurrent = currentStep === step.id;
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: step.id * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isDone
                                ? "bg-primary/5"
                                : isCurrent
                                  ? "bg-primary/10"
                                  : "opacity-40"
                            }`}
                          >
                            <div className="w-5 h-5 flex-shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : isCurrent ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-border/50" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isDone || isCurrent
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
