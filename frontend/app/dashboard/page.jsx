export default function DashboardPage() {
  return (
    <main className="flex h-full items-center justify-center bg-neutral-50 px-5 py-16 text-center text-neutral-900">
      <section>
        <p className="text-sm font-medium text-indigo-700">Your workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Start a conversation
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-neutral-600">
          Search for someone or open one of your chats to get started.
        </p>
      </section>
    </main>
  );
}
