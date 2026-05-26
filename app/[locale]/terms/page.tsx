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
  return buildLocalizedMetadata(locale as AppLocale, "terms");
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      locale={locale}
      title="Terms of Service"
      effectiveDate="May 27, 2026"
    >
      <p>
        These Terms of Service (&quot;<strong>Terms</strong>&quot;) govern your
        access to and use of Kawaragi (&quot;<strong>Kawaragi</strong>&quot;,
        &quot;<strong>we</strong>&quot;, &quot;<strong>our</strong>&quot;,
        or &quot;<strong>us</strong>&quot;), operated by Agisna at{" "}
        <a href="https://agisna.dev">agisna.dev</a>. By creating an account or
        using the service, you agree to these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 13 years old to use Kawaragi. If you are under the
        age of majority in your jurisdiction, you may only use the service with
        the involvement of a parent or guardian. By using Kawaragi you
        represent that you meet these requirements.
      </p>

      <h2>2. Your account</h2>
      <p>
        You are responsible for all activity that occurs under your account.
        Keep your Google sign-in credentials secure. Notify us immediately at{" "}
        <a href="mailto:hello@agisna.dev">hello@agisna.dev</a> if you suspect
        unauthorized access.
      </p>
      <p>
        You may have one account per person. You may not transfer your account
        to another person.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        You agree not to use Kawaragi to:
      </p>
      <ul>
        <li>
          Post content that is illegal, hateful, harassing, sexually explicit,
          violent, fraudulent, or that infringes intellectual property rights.
        </li>
        <li>
          Distribute malware, phishing links, or other links intended to harm
          visitors.
        </li>
        <li>
          Impersonate another person or misrepresent your affiliation.
        </li>
        <li>
          Spam, scrape, or attempt to overload the service or its analytics.
        </li>
        <li>
          Reverse engineer, decompile, or attempt to extract source code beyond
          what applicable law allows.
        </li>
        <li>
          Circumvent rate limits, abuse APIs, or interfere with other users.
        </li>
      </ul>
      <p>
        We may remove content and suspend accounts that violate these rules at
        our discretion.
      </p>

      <h2>4. Your content</h2>
      <p>
        You retain all rights to the content you publish on your link hub
        (text, images, links, embeds). You grant Kawaragi a worldwide,
        non-exclusive, royalty-free license to host, store, reproduce, and
        display that content as necessary to operate the service.
      </p>
      <p>
        You are solely responsible for content you publish. Make sure you have
        the right to share any images, GIFs, or media you upload.
      </p>

      <h2>5. Finance data</h2>
      <p>
        Finance information you enter or import (transactions, statements,
        budgets) is private to your account. We do not display it publicly and
        we do not sell or share it with third parties. See the{" "}
        <a href={`/${locale}/privacy`}>Privacy Policy</a> for details.
      </p>
      <p>
        Kawaragi is a personal-finance assistant. It is{" "}
        <strong>not</strong> a licensed financial advisor, bank, broker, or
        accountant. Information shown is for informational purposes only and
        should not be treated as financial, tax, or investment advice. You are
        responsible for verifying all transactions and consulting a qualified
        professional for financial decisions.
      </p>

      <h2>6. Third-party services and embeds</h2>
      <p>
        Kawaragi lets you embed content from third-party services such as
        TikTok and Instagram. These embeds are loaded directly from those
        services and are subject to their own terms and privacy policies.
        Kawaragi is not responsible for the availability, accuracy, or
        practices of third-party services.
      </p>

      <h2>7. Service availability</h2>
      <p>
        Kawaragi is provided on an &quot;as-is&quot; and &quot;as-available&quot;
        basis. We do not guarantee uninterrupted access. We may modify, suspend,
        or discontinue parts of the service at any time, with or without notice.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may stop using Kawaragi at any time. To delete your account, email{" "}
        <a href="mailto:hello@agisna.dev">hello@agisna.dev</a>. We may suspend
        or terminate your account if you violate these Terms or if continued
        provision becomes impractical.
      </p>
      <p>
        Upon termination, your data will be deleted within 30 days as
        described in the <a href={`/${locale}/privacy`}>Privacy Policy</a>.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, KAWARAGI AND AGISNA DISCLAIM
        ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
        THE SERVICE WILL BE ERROR-FREE OR SECURE, OR THAT YOUR DATA WILL NEVER
        BE LOST.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, KAWARAGI AND AGISNA WILL NOT BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING
        OUT OF YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY ARISING FROM OR
        RELATED TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE
        12 MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM, OR USD 50,
        WHICHEVER IS GREATER.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Kawaragi and Agisna from any
        claim, loss, or damage arising out of your content, your use of the
        service in violation of these Terms, or your violation of any law or
        third-party right.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Indonesia,
        without regard to its conflict-of-law provisions. Any dispute arising
        out of these Terms or your use of Kawaragi will be resolved in the
        competent courts of Indonesia, unless a mandatory local law in your
        jurisdiction provides otherwise.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms. Material changes will be announced on the
        site or by email. Continued use of Kawaragi after the &quot;Effective
        date&quot; means you accept the revised Terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, email{" "}
        <a href="mailto:hello@agisna.dev">hello@agisna.dev</a>.
      </p>
    </LegalPage>
  );
}
