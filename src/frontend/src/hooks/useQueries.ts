import { useQuery } from "@tanstack/react-query";
import type { Paper, PaperResult } from "../backend";
import { useActor } from "./useActor";

export function useAllPapers() {
  const { actor, isFetching } = useActor();
  return useQuery<Paper[]>({
    queryKey: ["papers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPapers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePaper(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Paper | null>({
    queryKey: ["paper", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getPaper(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function usePaperResults(paperId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PaperResult[]>({
    queryKey: ["paperResults", paperId],
    queryFn: async () => {
      if (!actor || !paperId) return [];
      return actor.getPaperResultsForPaper(paperId);
    },
    enabled: !!actor && !isFetching && !!paperId,
  });
}
