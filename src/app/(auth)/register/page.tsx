"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || t('auth.errors.registrationFailed') || "Registration failed");
      }
    } catch {
      setError(t('auth.errors.generic') || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('auth.register.title')}</CardTitle>
        <CardDescription>
          {t('auth.register.subtitle') || "Enter your details below to create your account"}
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
            <Label htmlFor="name">{t('auth.register.name')}</Label>
            <Input 
              id="name" 
              placeholder="John Doe" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.register.email')}</Label>
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
            <Label htmlFor="password">{t('auth.register.password')}</Label>
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
            ) : t('auth.register.button')}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            {t('auth.register.hasAccount')}{" "}
            <Link href="/login" className="font-bold text-primary hover:underline transition-all">
              {t('auth.register.logIn')}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
