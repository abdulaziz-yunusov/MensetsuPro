"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call for password reset
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your password
        </CardDescription>
      </CardHeader>
      
      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending link..." : "Send reset link"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4 pb-6">
          <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
            Try another email address
          </Button>
          <div className="text-sm text-center text-muted-foreground pt-4">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Return to sign in
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
