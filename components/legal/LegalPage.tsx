import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { GlassCard } from "@/components/ui/GlassCard";

type LegalPageProps = {
  locale: string;
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
};

/**
 * Shared shell for legal documents (Privacy, Terms).
 * Plain typography on purpose — these need to read like a real policy,
 * not a marketing page.
 */
export function LegalPage({
  locale,
  title,
  effectiveDate,
  children,
}: LegalPageProps) {
  return (
    <PageShell variant="violet">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Back to Kawaragi</span>
        </Link>

        <GlassCard padding="lg" className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Effective date: {effectiveDate}
            </p>
          </header>

          <article className="prose prose-zinc dark:prose-invert max-w-none text-[15px] leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_a]:text-violet-600 dark:[&_a]:text-violet-400 [&_a]:underline [&_strong]:font-semibold">
            {children}
          </article>

          <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-500 dark:text-zinc-400">
            Questions? Contact{" "}
            <a
              href="mailto:hello@agisna.dev"
              className="font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              hello@agisna.dev
            </a>
            .
          </footer>
        </GlassCard>
      </div>
    </PageShell>
  );
}
