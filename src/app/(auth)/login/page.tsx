"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError(
          res.error.includes("database") || res.error.includes("Database")
            ? t('auth.errors.database')
            : t('auth.errors.invalidCredentials')
        );
      } else {
        router.push("/dashboard");
        router.refresh(); // Crucial for updating server components relying on session
      }
    } catch {
      setError(t('auth.errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('auth.login.title')}</CardTitle>
        <CardDescription>
          {t('auth.login.subtitle')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.login.email')}</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                {t('auth.login.forgotPassword') || "Forgot password?"}
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted/30"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full font-bold h-11" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                {t('common.loading')}
              </>
            ) : t('auth.login.button')}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            {t('auth.login.noAccount')}{" "}
            <Link href="/register" className="font-bold text-primary hover:underline transition-all">
              {t('auth.login.signUp')}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
