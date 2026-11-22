import type { Metadata } from "next";
import InvitationView from "@/components/InvitationView";
import { parseInviteParams, WEDDING } from "@/lib/invitation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ to?: string; invitees?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const invite = parseInviteParams([], sp.to ?? null, sp.invitees ?? null);

  const title = invite.isPersonalized
    ? `${WEDDING.bride.name} & ${WEDDING.groom.name} — Invitation for ${invite.displayName}`
    : `${WEDDING.bride.name} & ${WEDDING.groom.name} — Wedding Invitation`;

  const inviteeText = invite.invitees ? ` (Invitees: ${invite.invitees})` : "";
  const description = invite.isPersonalized
    ? `Dear ${invite.displayName}${inviteeText}, ${WEDDING.bride.parents} cordially invite you to the wedding of ${WEDDING.bride.name} & ${WEDDING.groom.name} on ${WEDDING.event.fullDate} (${WEDDING.event.hijriDate}) at ${WEDDING.venue.name}, Indore.`
    : `${WEDDING.bride.parents} solicit the honour of your presence on ${WEDDING.event.fullDate} (${WEDDING.event.hijriDate}) at ${WEDDING.venue.name}, Indore.`;

  const ogParams = new URLSearchParams();
  if (invite.guestName) ogParams.set("name", invite.guestName);
  if (invite.invitees) ogParams.set("invitees", invite.invitees);
  const ogUrl = ogParams.toString() ? `/api/og?${ogParams.toString()}` : "/api/og";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const invite = parseInviteParams([], sp.to ?? null, sp.invitees ?? null);
  return <InvitationView key={`${invite.slugPath}|${invite.invitees ?? ""}`} invite={invite} />;
}
