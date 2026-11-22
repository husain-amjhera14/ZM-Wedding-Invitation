import type { Metadata } from "next";
import { headers } from "next/headers";
import InviteLinkGenerator from "@/components/InviteLinkGenerator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Personalized Invitation — Zahra & Mufaddal",
  description:
    "Enter a guest's name to generate a personalized wedding invitation link and ready-to-share WhatsApp message.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CreateInviteLinkPage() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const proto =
    hdrs.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("192.168.") || host.startsWith("10.")
      ? "http"
      : "https");
  const initialOrigin = host ? `${proto}://${host}` : "";

  return <InviteLinkGenerator initialOrigin={initialOrigin} />;
}
