"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!apiUrl) {
      setErrorMessage("The API URL is not configured.");
      return;
    }

    const body = {
      email,
      password,
    };
    if (isSignUp) body.username = name;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/users/${isSignUp ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Request failed. Please try again.");
      }

      if (isSignUp) {
        setName("");
        setEmail("");
        setPassword("");
        setIsSignUp(false);
        setSuccessMessage("Your account is ready. Log in to continue.");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 text-neutral-900">
      <section className="w-full max-w-md">
        <Link href="/" aria-label="Relay home" className="mx-auto mb-8 flex w-fit items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-600" />
          <span className="text-lg font-semibold tracking-tight">Relay</span>
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-9">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {isSignUp
                ? "Sign up to start connecting with your people."
                : "Log in to continue your conversations."}
            </p>
            {errorMessage && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {successMessage}
              </p>
            )}
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  minLength={3}
                  maxLength={20}
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={isSignUp ? 8 : undefined}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-600">
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp((current) => !current);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
