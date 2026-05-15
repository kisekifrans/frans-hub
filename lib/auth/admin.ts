/** Server-only: allowed admin email (lowercase). */
export function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (email) return email;
  if (process.env.NODE_ENV === "development") {
    return "putuagisna@gmail.com";
  }
  return "";
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const admin = getAdminEmail();
  if (!admin || !email) return false;
  return email.trim().toLowerCase() === admin;
}
