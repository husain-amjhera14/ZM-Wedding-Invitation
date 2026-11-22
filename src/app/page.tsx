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

  const ogUrl = "/api/og";

  return {
    title,
    description: "",
    openGraph: {
      type: "website",
      siteName: `${WEDDING.bride.name} & ${WEDDING.groom.name} — Wedding Invitation`,
      url: invite.slugPath,
      title,
      description: "",
      images: [
        {
          url: ogUrl,
          width: 600,
          height: 600,
          type: "image/png",
          alt: `${WEDDING.bride.name} & ${WEDDING.groom.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "",
      images: [ogUrl],
    },
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const invite = parseInviteParams([], sp.to ?? null, sp.invitees ?? null);
  return <InvitationView key={`${invite.slugPath}|${invite.invitees ?? ""}`} invite={invite} />;
}
