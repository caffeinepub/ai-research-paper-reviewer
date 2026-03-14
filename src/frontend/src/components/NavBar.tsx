import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  History,
  LogIn,
  LogOut,
  Microscope,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function NavBar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" || !!identity;
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navLinks = [
    { href: "/", label: "Home", icon: BookOpen },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Microscope className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-lg font-normal text-foreground hidden sm:block">
            AI <span className="text-primary">Reviewer</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.href;
            return (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 text-sm ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={`nav.${link.label.toLowerCase()}.link`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clear()}
              className="gap-2 border-border/50 text-muted-foreground hover:text-foreground"
              data-ocid="nav.login.button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="nav.login.button"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
