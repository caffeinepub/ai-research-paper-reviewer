import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  FileText,
  FlaskConical,
  RefreshCw,
  Search,
  Target,
  Upload,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Search,
    title: "Novelty Detection",
    desc: "Semantic similarity analysis to evaluate how unique your contribution is compared to existing literature.",
  },
  {
    icon: Cpu,
    title: "Methodology Analysis",
    desc: "Deep inspection of your research methodology, algorithm design, and experimental framework.",
  },
  {
    icon: CheckCircle2,
    title: "Claim Verification",
    desc: "Automatically extracts claims and cross-references them against your experimental evidence.",
  },
  {
    icon: RefreshCw,
    title: "Reproducibility Check",
    desc: "Evaluates whether your paper provides sufficient detail for others to replicate your results.",
  },
  {
    icon: FlaskConical,
    title: "Experiment Quality",
    desc: "Analyzes dataset size, baseline comparisons, ablation studies, and statistical rigor.",
  },
  {
    icon: Target,
    title: "Acceptance Predictor",
    desc: "Estimates the probability of acceptance at top-tier venues based on multi-dimensional scoring.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload PDF",
    desc: "Drop your research paper PDF and let our system extract structured sections automatically.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    desc: "Advanced NLP models evaluate novelty, methodology, experiments, citations, and reproducibility.",
  },
  {
    icon: FileText,
    step: "03",
    title: "Get Review",
    desc: "Receive a detailed peer-review quality report with scores, weaknesses, and actionable improvements.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-grid">
        {/* Atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.72 0.22 200 / 0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
              <Zap className="w-3 h-3" />
              AI-Powered Scientific Review
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-normal text-foreground leading-tight mb-6"
          >
            Peer Review
            <br />
            <span className="text-primary italic">Powered by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload your research paper and receive an expert-level review in
            seconds. Scores on novelty, methodology, reproducibility, and more —
            with actionable feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/upload">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base font-medium"
                data-ocid="home.start_button"
              >
                Start Analyzing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/history">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border/50 h-12 text-base"
              >
                <BarChart3 className="w-4 h-4" />
                View History
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-12 flex-wrap"
          >
            {[
              ["6", "Scoring Dimensions"],
              ["AI", "Powered Analysis"],
              ["PDF", "Instant Parsing"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-mono text-2xl font-bold text-primary">
                  {val}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-normal text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three steps from raw PDF to actionable review report
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.step} variants={item}>
                  <Card className="glass-card hover:border-primary/30 transition-colors h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="font-mono text-xs text-primary/50 mt-1">
                          {s.step}
                        </span>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg mb-2">
                        {s.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {s.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border/50 bg-grid">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-normal text-foreground mb-4">
              Comprehensive Analysis
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every dimension a real peer reviewer would evaluate
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={item}>
                  <Card className="glass-card hover:border-primary/40 transition-all hover:glow-cyan-sm h-full">
                    <CardContent className="p-6">
                      <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {f.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {f.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-normal text-foreground mb-4">
              Ready to Evaluate Your Paper?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join researchers worldwide who use AI to strengthen their papers
              before submission.
            </p>
            <Link to="/upload">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 text-base"
                data-ocid="home.start_button"
              >
                Upload Your Paper
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
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
      </footer>
    </main>
  );
}
