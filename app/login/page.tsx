import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in — Affiliate Hub Admin",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return <LoginForm error={params.error} next={params.next ?? "/admin"} />;
}
