import Navbar from "../components/Navbar.js";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-6 py-20">
        <section className="-mt-10 w-full max-w-3xl text-center">
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-neutral-950 sm:text-6xl md:text-7xl">
            A clearer way to
            <br />
            stay connected.
          </h1>

          <div className="mx-auto my-8 h-px w-12 bg-indigo-600/70" />

          <p className="mx-auto max-w-xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
            Bring your conversations together and keep collaboration moving in one focused space.
          </p>

          <Link
            href="/login"
            className="mt-9 inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Start a conversation
          </Link>
        </section>
      </main>
    </>
  );
}
