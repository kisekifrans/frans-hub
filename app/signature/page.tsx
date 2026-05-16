import { SignaturePageClient } from "@/components/signature/SignaturePageClient";

export const metadata = {
  title: "Signature Studio | Draw Your Signature",
  description:
    "Draw your real signature with mouse, touch, or stylus. Export transparent PNG or SVG.",
};

export default function SignaturePage() {
  return <SignaturePageClient />;
}
