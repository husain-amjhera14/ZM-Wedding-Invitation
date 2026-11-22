export const WEDDING = {
  monogram: "ZM",
  bride: {
    name: "Zahra",
    parents: "Mrs. Tasneem ben & Mr. Murtaza bhai Amjherawala (NKD, MKD)",
    grandparents: "Late Sakina ben & Late Shk. Najmuddin bhai Amjherawala",
  },
  groom: {
    name: "Mufaddal",
    parents: "Mrs. Nafisa Ben & Mr. Fakhruddin Bhai Presswala",
  },
  blessings: [
    "By The Grace Of Allah Ta'ala. Vasila-e-Panjatan Pak (A.S.)",
    "Dua Mubarak of Sayedna Mohammed Burhanuddin (R.A.)",
    "& Sayedna Aaliqadar Mufaddal Saifuddin (T.U.S.)",
  ],
  nikahNote:
    "Nikah Held in Rasme Saifee Surat on Dast Mubarak of Shehzada Idrees Bhai Sahab",
  event: {
    title: "Wedding Dinner — Zahra & Mufaddal",
    day: "Tuesday",
    dateNum: "12",
    dateSuffix: "th",
    monthYear: "Jan 2027",
    fullDate: "Tuesday, 12th January 2027",
    hijriDate: "5 Shaban Al Karim 1448 H",
    timeLabel: "Dinner (8:00 P.M.)",
    isoStart: "2027-01-12T20:00:00+05:30",
    isoEnd: "2027-01-12T23:00:00+05:30",
    // UTC equivalents for Google Calendar / ICS (IST = UTC+5:30)
    utcStart: "20270112T143000Z",
    utcEnd: "20270112T173000Z",
  },
  venue: {
    name: "Siyaganj Jamat Khana",
    city: "Indore, Madhya Pradesh",
    fullAddress: "Siyaganj Jamat Khana (Taheri Masjid, Siyaganj), Indore, Madhya Pradesh",
    mapUrl: "https://maps.app.goo.gl/KAoXriQ7MXvW453j6",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d920.0!2d75.8648276!3d22.7159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd005ddd4dbd%3A0x601393ff9fe5367c!2sTaheri%20Masjid%2C%20Siyaganj%20(Dawoodi%20Bohra%20Masjid)!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  },
  host: {
    family: "Amjherawala Family",
    signoff: "Relatives & Friends",
    firms: ["Najmi Bag Works", "Najmi Hardware"],
    contacts: [
      { display: "99770 06981", e164: "919977006981", label: "Murtaza Bhai" },
      { display: "98260 83590", e164: "919826083590", label: "Family Contact" },
      { display: "99770 06982", e164: "919977006982", label: "Family Contact" },
    ],
  },
} as const;

export interface ParsedInvite {
  guestName: string | null;
  displayName: string;
  invitees: string | null;
  isPersonalized: boolean;
  slugPath: string;
}

const SPECIAL_TOKENS: Record<string, string> = {
  mr: "Mr.",
  mrs: "Mrs.",
  ms: "Ms.",
  dr: "Dr.",
  shk: "Shk.",
  sk: "Sk.",
  janab: "Janab",
  mulla: "Mulla",
  bhai: "Bhai",
  ben: "Ben",
  saheb: "Saheb",
  sahab: "Sahab",
  and: "&",
  with: "with",
  of: "of",
  "s/o": "S/o",
  "d/o": "D/o",
};

function formatToken(token: string, index: number): string {
  const clean = token.trim();
  if (!clean) return "";
  const lower = clean.toLowerCase().replace(/\.$/, "");
  if (lower in SPECIAL_TOKENS) {
    // Keep lowercase conjunctions unless first word
    if ((lower === "with" || lower === "of") && index === 0) {
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return SPECIAL_TOKENS[lower];
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

export function formatSlugToName(rawSlug: string): string {
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {
    decoded = rawSlug;
  }

  const tokens = decoded
    .replace(/[_+]+/g, " ")
    .replace(/-+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.map((tok, i) => formatToken(tok, i)).join(" ");
}

export function parseInviteParams(
  slugSegments?: string[],
  queryName?: string | null,
  queryInvitees?: string | null
): ParsedInvite {
  const cleanSegments = (slugSegments ?? [])
    .map((s) => s.trim())
    .filter(Boolean);

  let rawName: string | null = null;
  let invitees: string | null = null;

  if (cleanSegments.length > 0) {
    rawName = formatSlugToName(cleanSegments[0]);
    if (cleanSegments.length >= 2) {
      let second = cleanSegments[1];
      try {
        second = decodeURIComponent(second);
      } catch {
        // keep original
      }
      invitees = second.replace(/[-_]+/g, " ").trim();
      if (invitees && !/^\d+$/.test(invitees)) {
        invitees = formatSlugToName(invitees);
      }
    }
  } else if (queryName && queryName.trim()) {
    rawName = formatSlugToName(queryName.trim());
  }

  if (!invitees && queryInvitees && queryInvitees.trim()) {
    invitees = queryInvitees.trim();
  }

  const isPersonalized = Boolean(rawName && rawName.length > 0);
  const slugPath = isPersonalized
    ? buildInvitePath(rawName!, invitees ?? undefined)
    : "/";

  return {
    guestName: isPersonalized ? rawName : null,
    displayName: isPersonalized ? rawName! : "Dear Family & Friends",
    invitees,
    isPersonalized,
    slugPath,
  };
}

export function slugifyPart(input: string): string {
  return input
    .trim()
    .replace(/&/g, " and ")
    .replace(/\./g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildInvitePath(guestName: string, invitees?: string): string {
  const nameSlug = slugifyPart(guestName);
  if (!nameSlug) return "/";
  const invSlug = invitees ? slugifyPart(invitees) : "";
  return invSlug ? `/${nameSlug}/${invSlug}` : `/${nameSlug}`;
}

export function buildGoogleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: WEDDING.event.title,
    dates: `${WEDDING.event.utcStart}/${WEDDING.event.utcEnd}`,
    details: `${WEDDING.bride.parents} solicit the honour of your presence at the wedding dinner of ${WEDDING.bride.name} & ${WEDDING.groom.name}.\n\n${WEDDING.event.hijriDate}\nMap Pin: ${WEDDING.venue.mapUrl}`,
    location: WEDDING.venue.fullAddress,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ZM Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:zm-wedding-20270112@amjherawala`,
    `DTSTAMP:20261122T060000Z`,
    `DTSTART:${WEDDING.event.utcStart}`,
    `DTEND:${WEDDING.event.utcEnd}`,
    `SUMMARY:${WEDDING.event.title}`,
    `DESCRIPTION:${WEDDING.bride.parents} solicit the honour of your presence at the wedding dinner of ${WEDDING.bride.name} & ${WEDDING.groom.name} (${WEDDING.event.hijriDate}). Directions: ${WEDDING.venue.mapUrl}`,
    `LOCATION:${WEDDING.venue.fullAddress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function buildWhatsAppRsvpUrl(
  guestName: string,
  attendees: string,
  attending: "accept" | "decline" = "accept",
  phoneE164: string = WEDDING.host.contacts[0].e164
): string {
  const lines =
    attending === "accept"
      ? [
          "Salaam!",
          `We joyfully accept the invitation and look forward to celebrating the wedding of ${WEDDING.bride.name} & ${WEDDING.groom.name} on ${WEDDING.event.fullDate}.`,
          "",
          `Name: ${guestName || "Guest"}`,
          `Guests Attending: ${attendees || "1"}`,
          "",
          "Warm regards!",
        ]
      : [
          "Salaam!",
          `Thank you so much for the warm invitation to ${WEDDING.bride.name} & ${WEDDING.groom.name}'s wedding. Regretfully, we won't be able to attend in person, but we send our heartfelt duas and Mubarak to the couple and the Amjherawala Family.`,
          "",
          `Name: ${guestName || "Guest"}`,
        ];

  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildWhatsAppWishesUrl(
  guestName: string,
  message: string,
  phoneE164: string = WEDDING.host.contacts[0].e164
): string {
  const lines = [
    `Dua & Wishes for ${WEDDING.bride.name} & ${WEDDING.groom.name}`,
    "",
    message.trim() || "Mubarak! Wishing Zahra & Mufaddal a blessed and joyful life together.",
    "",
    `— ${guestName || "Well Wisher"}`,
  ];
  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export const DEVELOPER_CREDIT = {
  name: "Husain Amjherawala",
  whatsappUrl: `https://wa.me/919977475253?text=${encodeURIComponent(
    "Salaam Husain! I loved Zahra & Mufaddal's digital wedding invitation. Could you share details for getting a custom invite like this made?"
  )}`,
} as const;

export function buildShareWhatsAppMessage(
  guestName: string,
  inviteUrl: string,
  invitees?: string
): string {
  const greeting = guestName ? `Salaam ${guestName},` : "Salaam,";
  const inviteeLine = invitees ? `\nInvitees: ${invitees}` : "";
  return [
    greeting,
    "",
    `With the grace of Allah Ta'ala and the blessings of Grand Parents *${WEDDING.bride.grandparents}*, *${WEDDING.bride.parents}* cordially invite you to the auspicious occasion of the wedding of their beloved daughter *${WEDDING.bride.name}* with *${WEDDING.groom.name}*.`,
    inviteeLine,
    `Date: ${WEDDING.event.fullDate} (${WEDDING.event.hijriDate})`,
    `Dinner: 8:00 P.M. at ${WEDDING.venue.name}, Indore`,
    "",
    "View your personalized invitation here:",
    inviteUrl,
    "",
    `With Warm Regards,`,
    `${WEDDING.host.family}`,
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n");
}
