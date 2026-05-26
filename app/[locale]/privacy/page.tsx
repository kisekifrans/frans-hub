import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { routing, type AppLocale } from "@/i18n/routing";

export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildLocalizedMetadata(locale as AppLocale, "privacy");
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      locale={locale}
      title="Privacy Policy"
      effectiveDate="May 27, 2026"
    >
      <p>
        This Privacy Policy describes how Kawaragi (&quot;<strong>Kawaragi</strong>
        &quot;, &quot;<strong>we</strong>&quot;, &quot;<strong>our</strong>
        &quot;, or &quot;<strong>us</strong>&quot;), operated by Agisna,
        collects, uses, and protects your information when you use{" "}
        <a href="https://agisna.dev">agisna.dev</a> and related products.
      </p>

      <h2>1. Information we collect</h2>

      <h3>Account information</h3>
      <p>
        When you sign in with Google, we receive your email address, display
        name, and profile picture from Google. We do not request your contacts,
        Google Drive, calendar, or any other Google data.
      </p>

      <h3>Profile content</h3>
      <p>
        We store the content you publish to your public link hub (username,
        bio, links, embeds, theme, uploaded images and GIFs). This content is
        visible to anyone who visits your public page.
      </p>

      <h3>Finance content (Aura)</h3>
      <p>
        If you use the Aura / Finance feature, we store financial data you
        submit (transactions, categories, budgets, payment methods, subscriptions)
        and, optionally, bank/e-wallet PDF statements you upload. Finance data
        is <strong>private to your account</strong> and is never displayed on
        your public link hub.
      </p>
      <p>
        PDF statements are processed in your browser and on our servers solely
        to extract transactions you can review and save. Statement files are
        deleted from our storage after import processing completes (or within 1
        hour if processing fails).
      </p>

      <h3>Analytics</h3>
      <p>
        When someone visits your public link hub, we record anonymous page
        views and link clicks, plus aggregated device, browser, and country
        information derived from the request. We do not set cross-site tracking
        cookies and we do not sell analytics data to third parties.
      </p>

      <h3>Logs</h3>
      <p>
        Our hosting provider records standard request logs (IP address, user
        agent, timestamp) for security and abuse prevention. We retain these
        logs for up to 30 days.
      </p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To operate the service and provide the features you use.</li>
        <li>To display your public link hub at your chosen URL.</li>
        <li>To parse and categorize finance statements you upload.</li>
        <li>To detect abuse, fraud, and security threats.</li>
        <li>To respond to your support requests.</li>
      </ul>
      <p>
        We do not use your finance data to train AI models, advertise to you,
        or share with third parties for marketing.
      </p>

      <h2>3. Sharing and third-party processors</h2>
      <p>
        We use the following processors to operate the service:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — database, authentication, and storage.
        </li>
        <li>
          <strong>Google</strong> — sign-in (Google OAuth). We receive only the
          profile fields listed above.
        </li>
        <li>
          <strong>Vercel</strong> — application hosting and request logs.
        </li>
      </ul>
      <p>
        We do not sell your personal information. We do not share your finance
        data with any third party except the processors listed above, which are
        bound by their own privacy commitments.
      </p>

      <h2>4. Data retention and deletion</h2>
      <p>
        We retain your account data while your account is active. If you delete
        your account, we permanently delete your profile, links, uploaded
        media, finance data, and analytics within 30 days. Anonymous aggregate
        statistics may be retained.
      </p>
      <p>
        To delete your account, email{" "}
        <a href="mailto:hello@agisna.dev">hello@agisna.dev</a> from the address
        associated with your account. We will confirm and complete the deletion
        within 30 days.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Depending on your location, you may have the right to:
      </p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate data.</li>
        <li>Request deletion of your data.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Receive your data in a portable format.</li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a href="mailto:hello@agisna.dev">hello@agisna.dev</a>. We will respond
        within 30 days.
      </p>

      <h2>6. Children</h2>
      <p>
        Kawaragi is not directed to children under 13, and we do not knowingly
        collect personal information from children under 13. If you believe a
        child has provided us with personal information, contact us and we will
        delete it.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard measures including encrypted transport
        (HTTPS), encrypted storage at rest, row-level security in the database,
        and access controls for staff. No system is perfectly secure; you use
        Kawaragi at your own risk.
      </p>

      <h2>8. International transfers</h2>
      <p>
        Kawaragi is operated from Indonesia, and our processors store data in
        their respective regions (typically Singapore for Supabase and global
        edge regions for Vercel). By using Kawaragi you consent to the transfer
        and processing of your data in these regions.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy. Material changes will be announced
        on the site or by email. The &quot;Effective date&quot; at the top of
        this page reflects the most recent revision.
      </p>

      <h2>10. Contact</h2>
      <p>
        For privacy questions, email{" "}
        <a href="mailto:hello@agisna.dev">hello@agisna.dev</a>.
      </p>
    </LegalPage>
  );
}
