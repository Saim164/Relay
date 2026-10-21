"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "../../components/FormField.jsx";
import { apiRequest } from "../../lib/api.js";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await apiRequest("/users/register", {
          method: "POST",
          body: { username, email, password },
        });
        setUsername("");
        setEmail("");
        setPassword("");
        setIsSignUp(false);
        setSuccessMessage("Your account is ready. Log in to continue.");
      } else {
        await apiRequest("/users/login", { method: "POST", body: { email, password } });
        router.replace("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-neutral-50 px-4 py-12 text-neutral-900">
      <section className="w-full max-w-md">
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
              <FormField
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                minLength={USERNAME_MIN_LENGTH}
                maxLength={USERNAME_MAX_LENGTH}
                placeholder="3–20 characters, used to find you"
              />
            )}

            <FormField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />

            <FormField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={isSignUp ? PASSWORD_MIN_LENGTH : undefined}
              placeholder="Enter your password"
            />

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
