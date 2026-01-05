"use client";

import Link from "next/link";
import { Wallet, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { signInWithGoogle, signOutUser } from "@/lib/authActions";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Bill Tracker</div>
            <div className="text-xs text-slate-300">Next.js + Firebase</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <div className="hidden items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-200 md:flex">
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[220px] truncate">{user.email ?? user.uid}</span>
              </div>
              <Button
                variant="outline"
                className="rounded-2xl gap-2"
                onClick={() => void signOutUser()}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <Button
              className="rounded-2xl gap-2"
              onClick={() => void signInWithGoogle()}
              disabled={loading}
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
