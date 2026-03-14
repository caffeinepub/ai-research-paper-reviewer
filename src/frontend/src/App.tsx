import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { NavBar } from "./components/NavBar";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { ResultsPage } from "./pages/ResultsPage";
import { UploadPage } from "./pages/UploadPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Outlet />
      <Toaster theme="dark" />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results/$paperId",
  component: ResultsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadRoute,
  resultsRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
