import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Relay home"
          className="group flex items-center gap-2 no-underline hover:no-underline"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-600 transition-transform group-hover:scale-110" />
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Relay
          </span>
        </Link>

        <Link
          href="/login"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          Log in
        </Link>
      </div>
    </header>
  );
}