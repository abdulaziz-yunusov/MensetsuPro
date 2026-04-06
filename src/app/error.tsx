"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isLikelyDatabaseError } from "@/lib/db-error";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDatabaseError = isLikelyDatabaseError(error) || /database/i.test(error.message);

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isDatabaseError ? "Database Temporarily Unavailable" : "Page Failed to Load"}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {isDatabaseError
              ? "The page depends on database data, but the application could not reach the configured PostgreSQL server."
              : "An unexpected error interrupted this page render."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            {isDatabaseError
              ? "This is not a wrong-password issue on its own. Until the database connection is restored, sign up, login, and data-backed pages may fail."
              : "Try reloading once. If the problem continues, inspect the server logs for the failing route."}
          </p>
          {isDatabaseError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              Check `DATABASE_URL` and optional `DIRECT_URL`, then run `npm run db:check` from the project root.
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
