import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ExternalLink, FileText, Inbox, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllPapers } from "../hooks/useQueries";

const recommendationColors: Record<string, string> = {
  strongAccept: "border-green-500/30 bg-green-500/10 text-green-400",
  accept: "border-green-400/30 bg-green-400/10 text-green-400",
  weakAccept: "border-lime-400/30 bg-lime-400/10 text-lime-400",
  borderline: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  weakReject: "border-orange-400/30 bg-orange-400/10 text-orange-400",
  reject: "border-red-400/30 bg-red-400/10 text-red-400",
  strongReject: "border-red-500/30 bg-red-500/10 text-red-500",
};

export function HistoryPage() {
  const { identity, loginStatus, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" || !!identity;
  const { data: papers, isLoading } = useAllPapers();

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-normal text-foreground mb-3">
            Sign In Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to view your paper review history and access previous
            analyses.
          </p>
          <Button
            size="lg"
            onClick={() => login()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl font-normal text-foreground mb-2">
            Review History
          </h1>
          <p className="text-muted-foreground">
            All previously analyzed research papers
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {["sk1", "sk2", "sk3", "sk4"].map((k) => (
              <Skeleton key={k} className="h-20 w-full" />
            ))}
          </div>
        ) : !papers || papers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
            data-ocid="history.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-normal text-foreground mb-2">
              No papers yet
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t analyzed any papers yet. Upload your first paper
              to get started.
            </p>
            <Link to="/upload">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <FileText className="w-4 h-4" />
                Upload First Paper
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
            data-ocid="history.list"
          >
            {papers.map((paper, i) => {
              const date = new Date(
                Number(paper.uploadedAt) / 1_000_000,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`history.item.${i + 1}`}
                >
                  <Card className="glass-card hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-medium truncate max-w-sm">
                              {paper.title}
                            </p>
                            <p className="text-muted-foreground text-xs mt-0.5">
                              {date} · {paper.filename}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize border ${recommendationColors[paper.status] || "border-border/50 text-muted-foreground"}`}
                          >
                            {paper.status}
                          </Badge>
                          <Link
                            to="/results/$paperId"
                            params={{ paperId: paper.id }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-border/50 text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Report
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/50 py-8">
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
