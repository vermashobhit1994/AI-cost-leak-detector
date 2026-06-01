import { AuditForm } from "@/components/AuditForm";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <header className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
          Free · No login · Instant
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Find where your AI spend is leaking
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Audit your AI tool spend. Audit Cursor, Copilot, Claude, ChatGPT, and
          more — get plan fixes and savings in seconds.
        </p>
      </header>

      <AuditForm />

      <footer className="mt-16 border-t border-card-border pt-8 text-center text-sm text-muted">
        <p>
          Built for startup founders & eng leaders ·{" "}
          <Link href="https://credex.rocks" className="text-accent hover:underline">
            Credex
          </Link>
        </p>
      </footer>
    </main>
  );
}
