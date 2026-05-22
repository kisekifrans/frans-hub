"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";
import { MemberAreaLink } from "@/components/auth/MemberAreaLink";
import { HeroInsightCards } from "@/components/landing/HeroInsightCards";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { RecapPreview } from "@/components/landing/RecapPreview";
import {
  LANDING_PAYMENT_KEYS,
  type LandingPaymentKey,
} from "@/components/landing/landing-insights";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageShell } from "@/components/ui/PageShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp } from "@/components/ui/motion";
import { getSiteProfileSlug } from "@/lib/config/site-profile";
import { cn } from "@/lib/utils";

const PAYMENT_EMOJI: Record<LandingPaymentKey, string> = {
  gopay: "🟢",
  ovo: "🟣",
  dana: "🔵",
  shopeePay: "🧡",
};

export function LandingPage() {
  const t = useTranslations("landing");
  const siteSlug = getSiteProfileSlug();

  return (
    <PageShell variant="violet" contentClassName="min-h-screen">
      <LandingHeader>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
          <LocaleLink
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            {t("brand")}
            <span className="text-violet-600 dark:text-violet-400">.io</span>
          </LocaleLink>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <MemberAreaLink
              next="/dashboard"
              className="touch-manipulation rounded-full bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition active:scale-[0.98] hover:bg-violet-500 sm:px-3.5 sm:py-1.5"
              aria-label={t("nav.signIn")}
            >
              {t("nav.signIn")}
            </MemberAreaLink>
          </div>
        </div>
      </LandingHeader>

      <main className="landing-main mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        {/* Hero */}
        <section className="relative pt-6 sm:pt-14 lg:pt-16">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ duration: 0.55 }}
            className="relative z-20 mx-auto max-w-xl text-center sm:max-w-2xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400 sm:text-xs sm:tracking-[0.2em]">
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-3 text-[1.6rem] font-semibold leading-[1.14] tracking-tight text-zinc-900 dark:text-white sm:mt-4 sm:text-4xl lg:text-[2.85rem]">
              {t("hero.title")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-100 sm:mt-4 sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-[13px] leading-snug text-zinc-600 dark:text-zinc-400 sm:mt-6 sm:max-w-md sm:space-y-2.5 sm:text-sm">
              {(["step1", "step2", "step3"] as const).map((key) => (
                <li key={key} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                    aria-hidden
                  />
                  <span>{t(`hero.${key}`)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
              <Link
                href="/login?next=/finance"
                className="landing-cta-primary inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition active:scale-[0.98] hover:bg-violet-500 dark:shadow-violet-900/35 sm:hover:shadow-violet-500/30"
              >
                {t("hero.ctaPrimary")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#recap"
                className="landing-cta-secondary inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full border border-zinc-200/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition active:scale-[0.98] dark:border-white/15 dark:bg-white/8 dark:text-zinc-100 sm:hover:-translate-y-0.5"
              >
                {t("hero.ctaSecondary")}
              </a>
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {t("hero.ctaHelper")}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              {t("hero.note")}
            </p>
          </motion.div>

          <HeroInsightCards />
        </section>

        {/* Indonesian-first */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="mt-16 sm:mt-28"
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              {t("local.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              {t("local.subtitle")}
            </p>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {LANDING_PAYMENT_KEYS.map((key, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="landing-payment-pill inline-flex min-h-[40px] items-center gap-2 rounded-full border border-zinc-200/70 bg-white/85 px-3.5 py-2 text-sm font-medium text-zinc-800 shadow-sm dark:border-white/14 dark:bg-white/10 dark:text-zinc-100">
                  <span aria-hidden>{PAYMENT_EMOJI[key]}</span>
                  {t(`local.payments.${key}`)}
                </span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t("local.footer")}
          </p>
        </motion.section>

        {/* Recap preview */}
        <section id="recap" className="mt-16 scroll-mt-[4.5rem] sm:mt-28 sm:scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              {t("recap.sectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              {t("recap.sectionSubtitle")}
            </p>
          </motion.div>
          <div className="landing-recap-section mt-8 sm:mt-12">
            <RecapPreview />
          </div>
        </section>

        {/* Trust */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-28"
        >
          <GlassCard
            padding="lg"
            className="mx-auto max-w-2xl border-zinc-200/70 bg-white/75 dark:border-white/10"
          >
            <h2 className="text-center text-lg font-semibold text-zinc-900 dark:text-white">
              {t("trust.title")}
            </h2>
            <ul className="mt-6 space-y-4">
              {(
                [
                  { icon: Trash2, key: "pdf" as const },
                  { icon: Lock, key: "private" as const },
                  { icon: Shield, key: "noBank" as const },
                ] as const
              ).map(({ icon: Icon, key }) => (
                <li key={key} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="pt-1.5 leading-relaxed">{t(`trust.${key}`)}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.section>

        {/* Footer CTA */}
        <section className="mt-16 text-center sm:mt-20">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("footer.tagline")}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?next=/finance"
              className="landing-cta-primary inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-violet-500"
            >
              {t("footer.cta")}
            </Link>
            <Link
              href={`/${siteSlug}`}
              className={cn(
                "text-sm font-medium text-violet-600 underline-offset-4 hover:underline dark:text-violet-400",
              )}
            >
              {t("footer.exampleHub")}
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
